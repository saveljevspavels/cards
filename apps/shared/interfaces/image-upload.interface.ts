export interface UploadedImage {
    id: string;
    urls: {
        [key: string]: string;
    }
    timestamp: string;
}

export enum CompressionType {
    REGULAR = 'REGULAR',
    THUMBNAIL = 'THUMBNAIL',
}