import { Injectable } from '@angular/core';
import {UtilService} from "./util.service";
import {AngularFireStorage} from "@angular/fire/compat/storage";
import imageCompression from "browser-image-compression";
import ExifReader from 'exifreader';
import {BehaviorSubject} from "rxjs";
import {CompressionType, UploadedImage} from "../../../../shared/interfaces/image-upload.interface";

export interface UploadStatus {
    total: number;
    loaded: number;
    active: boolean;
}

const TARGET_DIRECTORIES: Map<CompressionType, string> = new Map<CompressionType, string>([
    [CompressionType.REGULAR, 'images'],
    [CompressionType.THUMBNAIL, 'thumbnails']
]);

@Injectable({
    providedIn: 'root'
})
export class FileService {

    public uploadStatus: BehaviorSubject<UploadStatus> = new BehaviorSubject<UploadStatus>({
        total: 0,
        loaded: 0,
        active: false,
    });

    constructor(private storage: AngularFireStorage) {}

    async uploadImages(files: any[]): Promise<UploadedImage[]> {
        if (!files.length) return [];

        this.uploadStatus.next({
            loaded: 0,
            total: files.length,
            active: true,
        });

        let loaded = 0;

        const uploads = files.map(async (file, index) => {
            try {
                const result = await this.uploadImageFile(file);
                return result;
            } finally {
                loaded++;
                this.uploadStatus.next({
                    loaded,
                    total: files.length,
                    active: true,
                });
            }
        });

        const uploadedImages = await Promise.allSettled(uploads);

        this.uploadStatus.next({
            loaded: files.length,
            total: files.length,
            active: false,
        });

        return uploadedImages
            .filter((r): r is PromiseFulfilledResult<UploadedImage> => r.status === "fulfilled")
            .map(r => r.value);
    }

    async uploadImageGroups(groups: File[][], retries = 3, delayMs = 1000): Promise<UploadedImage[][]> {
        const total = groups.reduce((acc, group) => acc + group.length, 0);
        if (total === 0) return [];

        let loaded = 0;

        // Initialize global status
        this.uploadStatus.next({ loaded, total, active: true });

        // Upload all groups in parallel, each with retry
        const groupResults = await Promise.allSettled(
            groups.map(group =>
                UtilService.retry(async () => {
                    // Upload each file in the group
                    const uploads = group.map(async file => {
                        try {
                            return await this.uploadImageFile(file);
                        } finally {
                            loaded++;
                            this.uploadStatus.next({ loaded, total, active: true });
                        }
                    });

                    const uploaded = await Promise.allSettled(uploads);
                    return uploaded
                        .filter((r): r is PromiseFulfilledResult<UploadedImage> => r.status === "fulfilled")
                        .map(r => r.value);
                }, retries, delayMs, true) // retries per group with exponential backoff
            )
        );

        // Finalize status
        this.uploadStatus.next({ loaded: total, total, active: false });

        // Map results, keep empty array for groups that failed completely
        return groupResults.map(r =>
            r.status === "fulfilled" ? r.value : []
        );
    }

    async uploadImageFile(file: File): Promise<UploadedImage> {
        const id = UtilService.generateId();
        const uploadedImage: UploadedImage = {
            id,
            urls: {},
            timestamp: await this.getFileTimestamp(file),
        }
        for (const type of [CompressionType.REGULAR, CompressionType.THUMBNAIL]) {
            const compressedImage = await this.compressImage(file, type);
            await this.storage.upload(`${TARGET_DIRECTORIES.get(type)}/${id}`, compressedImage);
            uploadedImage.urls[type] = await this.storage.ref(`${TARGET_DIRECTORIES.get(type)}/${id}`).getDownloadURL().toPromise();
        }
        return uploadedImage;
    }

    async compressImage(imageFile: File, type: CompressionType): Promise<Blob> {
        let options;
        switch (type) {
            case CompressionType.THUMBNAIL:
                options = {
                    maxSizeMB: 0.1,
                    maxWidthOrHeight: 300,
                    useWebWorker: true,
                };
                break;
            default: options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 2160,
                useWebWorker: true,
            };
        }
        try {
            return await imageCompression(imageFile, options);
        } catch (error) {
            console.log('Failed to compress image', error);
            return imageFile;
        }
    }

    async getFileTimestamp(file: File): Promise<string> {
        const tags = await ExifReader.load(file);
        const imageDate = tags['DateTimeOriginal']?.description;
        return imageDate ?? '';
    }
}
