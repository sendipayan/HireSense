import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3=new S3Client({
    region:process.env.AWS_REGION!,
    credentials:{
        accessKeyId:process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY!
    },
})

export function getPdfUrl(
    key: string,
    contentType: string,
    contentDisposition: "inline" | "attachment",
) {
    return getSignedUrl(
        s3,
        new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: key,
            ResponseContentType: contentType,
            ResponseContentDisposition: contentDisposition,
        }),
        { expiresIn: 300 },
    );
}
