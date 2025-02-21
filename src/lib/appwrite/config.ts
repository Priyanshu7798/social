import {Client ,Account, Databases,Storage, Avatars } from 'appwrite'

export const appwriteConfig ={
    url:import.meta.env.VITE_APPWRITE_URL,
    projectId : import.meta.env.VITE_APPWRITE_PROJECT_ID,
    databaseid: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    storageid: import.meta.env.VITE_APPWRITE_STORAGE_ID,
    userCollectionid: import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID,
    postCollectionid: import.meta.env.VITE_APPWRITE_POST_COLLECTION_ID,
    savesCollectionid: import.meta.env.VITE_APPWRITE_SAVES_COLLECTION_ID,

}

export const client =new Client()

client.setEndpoint(appwriteConfig.url);
client.setProject(appwriteConfig.projectId);

export const account =new Account(client)
export const databases =new Databases(client)
export const storage =new Storage(client)
export const avatars =new Avatars(client)