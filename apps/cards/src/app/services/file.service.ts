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
        const uploadedImages: UploadedImage[] = []
        if(files.length) {
            this.uploadStatus.next({
                loaded: 0,
                total: files.length,
                active: true,
            });
            await Promise.all(files.map(async (file) => {
                uploadedImages.push(await this.uploadImageFile(file));
                this.uploadStatus.next({...this.uploadStatus.value, loaded: this.uploadStatus.value.loaded + 1});
            }));
            this.uploadStatus.next({...this.uploadStatus.value, active: false});
        }
        return uploadedImages;
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
                    maxWidthOrHeight: 200,
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