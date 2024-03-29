import { Injectable } from '@angular/core';
import {AngularFireStorage} from "@angular/fire/storage";
import {UtilService} from "./util.service";

@Injectable()
export class FileService {

    constructor(private storage: AngularFireStorage) {}

    async uploadImages(files: any[]): Promise<string[]> {
        const uploadedFileIds = []
        if(files.length) {
            for(let i = 0; i < files.length; i++) {
                const id = UtilService.generateId()
                await this.storage.upload(`images/${id}`, files[i]);
                const url = await this.storage.ref(`images/${id}`).getDownloadURL().toPromise()
                uploadedFileIds.push(url)
            }
        }
        return uploadedFileIds;
    }
}
