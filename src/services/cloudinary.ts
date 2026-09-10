const CLOUD_NAME = "i54rxcou";
const UPLOAD_PRESET = "ml_default";

export interface CloudinaryUploadResult {
	secure_url: string;
	public_id: string;
	format: string;
	bytes: number;
	original_filename: string;
}

export const cloudinaryService = {
	uploadFile: async (
		file: File,
		folder = "invoices"
	): Promise<CloudinaryUploadResult> => {
		const formData = new FormData();
		formData.append("file", file);
		formData.append("upload_preset", UPLOAD_PRESET);
		formData.append("folder", folder);

		const response = await fetch(
			`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
			{
				method: "POST",
				body: formData,
			}
		);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				errorData?.error?.message || "Failed to upload file to Cloudinary"
			);
		}

		return await response.json();
	},
};
