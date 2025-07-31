const conf = {
    appwriteUrl: String(import.meta.env.VITE_APPWRITE_URL),
    appwriteProjectId: String(import.meta.env.VITE_APPWRITE_PROJECT_ID),
    appwriteDatabaseId: String(import.meta.env.VITE_APPWRITE_DATABASE_ID),
    appwriteCollectionId: String(import.meta.env.VITE_APPWRITE_COLLECTION_ID),
    appwriteBucketId: String(import.meta.env.VITE_APPWRITE_BUCKET_ID),
    tinymceApiKey: String(import.meta.env.VITE_TINYMCE_API_KEY || ''),
    appwriteUsersCollectionId: String(import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID || 'users'),
    appwriteStatsCollectionId: String(import.meta.env.VITE_APPWRITE_STATS_COLLECTION_ID || 'stats'),
    geminiApiKey: String(import.meta.env.VITE_APP_GEMINI_API_KEY || ''),
}
// there was a name issue with the import.meta.env.VITE_APPWRITE_URL, it was later fixed in debugging video

export default conf