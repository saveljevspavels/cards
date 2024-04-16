import { Injectable } from '@angular/core';
import {UtilService} from "./util.service";
import {AngularFireStorage} from "@angular/fire/compat/storage";
import imageCompression from "browser-image-compression";
import ExifReader from 'exifreader';
import {BehaviorSubject} from "rxjs";

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

    async uploadImages(files: any[]): Promise<string[]> {
        const uploadedFileIds: string[] = []
        if(files.length) {
            this.uploadStatus.next({
                loaded: 0,
                total: files.length,
                active: true,
            });
            await Promise.all(files.map(async (file) => {
                const id = UtilService.generateId()
                this.getFileMetadata(file);
                const compressedImage = await this.compressImage(file);
                await this.storage.upload(`images/${id}`, compressedImage);
                const url: string = await this.storage.ref(`images/${id}`).getDownloadURL().toPromise()
                uploadedFileIds.push(url);
                this.uploadStatus.next({...this.uploadStatus.value, loaded: this.uploadStatus.value.loaded + 1});
            }));
            this.uploadStatus.next({...this.uploadStatus.value, active: false});
        }
        return uploadedFileIds;
    }

    async compressImage(imageFile: File): Promise<Blob> {
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 2160,
            useWebWorker: true,
        }
        try {
            return await imageCompression(imageFile, options);
        } catch (error) {
            console.log('Failed to compress image', error);
            return imageFile;
        }
    }

    async getFileMetadata(file: File): Promise<any> {
        const tags = await ExifReader.load(file);
        const imageDate = tags['DateTimeOriginal']?.description;
        const unprocessedTagValue = tags['DateTimeOriginal']?.value;
        // console.log('Image date:', imageDate);
        // console.log('Unprocessed tag value:', unprocessedTagValue);
    }
}

export interface UploadStatus {
    total: number;
    loaded: number;
    active: boolean;
}