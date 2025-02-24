import { INewPost, INewUser, IUpdatePost } from "@/types";
import {ID, ImageGravity, Query} from 'appwrite'
import { account, appwriteConfig, avatars, databases, storage } from "./config";

export async function createUserAccount(user:INewUser) {
    try {
        const newAccount = await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name,            
        );

        if(!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(user.name);

        //  save the data to Database
        const newUser = await saveUserToDB({
            accountId: newAccount.$id,
            name : newAccount.name,
            email: newAccount.email,
            username:user.username,
            imageUrl: new URL(avatarUrl), // converts String to URL
        })

        return newUser;
    } catch (error) {
        console.log(error);
        return error;
    }
}

export async function saveUserToDB(user:{
    accountId:string,
    email:string,
    name: string,
    imageUrl :URL,
    username ? :string,
}) {
    try {
       const newUser= await databases.createDocument(
            appwriteConfig.databaseid,
            appwriteConfig.userCollectionid,
            ID.unique(),
            user,
        ) 


        return newUser;
    } catch (error) {
        console.log(error);
        
    }
}

// Sign In 
export async function signInAccount(user: { email:string , password :string}) {
    
    try {
        
         // Check if there's an active session
        const sessions = await account.getSession("current").catch(() => null);
    
        if (sessions) {
            console.log("Existing session found. Logging out...");
            await account.deleteSession("current"); // Logout before logging in
        }

        // New Session
        return await account.createEmailPasswordSession(user.email,user.password);

    } catch (error) {
        console.log(error);
        
    }
}

// ============================== GET ACCOUNT
export async function getAccount() {
    try {
      const currentAccount = await account.get();
  
      return currentAccount;
    } catch (error) {
      console.log(error);
    }
  }

// get current user

export async function getCurrentUser(){
    try {
        const currentAccount = await getAccount();
    
        if (!currentAccount) throw Error;
    
        const currentUser = await databases.listDocuments(
          appwriteConfig.databaseid,
          appwriteConfig.userCollectionid,
          [Query.equal("accountId", currentAccount.$id)]
        );
    
        if (!currentUser) throw Error;
    
        return currentUser.documents[0];
    } catch (error) {
        console.log(error);
        
    }
}


export async function signOutAccount() {
    try {
        
        const session = await account.deleteSession('current');

        return session;

    } catch (error) {
        console.log(error);
        
    }
}

export async function createPost(post: INewPost) {
    try {
      // Upload file to appwrite storage
      const uploadedFile = await uploadFile(post.file[0]);
      
      if (!uploadedFile) throw Error;
  
      // Get file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }
  
      // Convert tags into array
      const tags = post.tags?.replace(/ /g, "").split(",") || [];
      
      // Create post
      const newPost = await databases.createDocument(
        appwriteConfig.databaseid,
        appwriteConfig.postCollectionid,
        ID.unique(),
        {
          creater: post.userId,
          caption: post.caption,
          imageUrl: fileUrl,
          imageID: uploadedFile.$id,
          location: post.location,
          tags: tags,
        }
      );
  
      if (!newPost) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      return newPost;
    } catch (error) {
      console.log(error);
    }
  }
  
  // ============================== UPLOAD FILE
export async function uploadFile(file: File) {
try {
    const uploadedFile = await storage.createFile(
    appwriteConfig.storageid,
    ID.unique(),
    file
    );

    return uploadedFile;
} catch (error) {
    console.log(error);
}
}

// ============================== GET FILE URL
export function getFilePreview(fileId: string) {
try {
    const fileUrl = storage.getFilePreview(
    appwriteConfig.storageid,
    fileId,
    2000,
    2000,
    ImageGravity.Top,
    100
    );

    if (!fileUrl) throw Error;

    return fileUrl;
} catch (error) {
    console.log(error);
}
}

// ============================== DELETE FILE
export async function deleteFile(fileId: string) {
try {
    await storage.deleteFile(appwriteConfig.storageid, fileId);

    return { status: "ok" };
} catch (error) {
    console.log(error);
}
}

// ============================== Get Recnet Posts
export async function getRecentPosts(){
    const posts = await databases.listDocuments(
        appwriteConfig.databaseid,
        appwriteConfig.postCollectionid,
        [Query.orderDesc('$createdAt'),Query.limit(20)]
    )

    if(!posts) throw Error;

    return posts;
}

export async function likePost (postId :string , likesArray : string[]) {

    try {
        
        const updatePost = await databases.updateDocument(
            appwriteConfig.databaseid,
            appwriteConfig.postCollectionid,
            postId,
            {
                likes : likesArray
            }
        )

        if(!updatePost) throw Error;

        return updatePost;
        
    } catch (error) {
        console.log(error);
        
    }
}

export async function savePost (postId :string ,userId :string) {

    try {
        
        const updatePost = await databases.createDocument(
            appwriteConfig.databaseid,
            appwriteConfig.savesCollectionid,
            ID.unique(),
            {
                user : userId,
                post : postId,
            }
        )

        if(!updatePost) throw Error;

        return updatePost;

    } catch (error) {
        console.log(error);
        
    }
}

export async function delteSavedPost(savedRecordId : string) {
    
    try {
        const statusCode = await databases.deleteDocument(
            appwriteConfig.databaseid,
            appwriteConfig.savesCollectionid,
            savedRecordId,
        );
        

        if(!statusCode) throw Error;

        return {status : 'ok'}
    } catch (error) {
        console.log(error);
        
    }
}

export async function getPostById (postId : string) {
    try {

        const post = await databases.getDocument(
            appwriteConfig.databaseid,
            appwriteConfig.postCollectionid,
            postId,
        )

        if(!post) throw Error;

        return post;

    } catch (error) {
        console.log(error);
        
    }
}

export async function updatePost (post : IUpdatePost) {

    const hasFileToUpdate = post.file.length>0;
    try {

        let image = {
            imageUrl : post.imageUrl,
            imageId : post.imageId,
        }

        if(hasFileToUpdate){
            // Upload file to appwrite storage
            const uploadedFile = await uploadFile(post.file[0]);
            
            if (!uploadedFile) throw Error;
            // Get file url
            const fileUrl = getFilePreview(uploadedFile.$id);
            
            if (!fileUrl) {
                await deleteFile(uploadedFile.$id);
                throw Error;
            }
            image ={...image, imageUrl : new URL(fileUrl), imageId : uploadedFile.$id}
        }


        // Convert tags into array
        const tags = post.tags?.replace(/ /g, "").split(",") || [];
        
        // Create post
        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseid,
            appwriteConfig.postCollectionid,
            post.postId,
            {
            caption: post.caption,
            imageUrl: image.imageUrl,
            imageID: image.imageId,
            location: post.location,
            tags: tags,
            }
        );

        if (!updatedPost) {
            await deleteFile(post.imageId);
            throw Error;
        }

        return updatedPost;
    } catch (error) {
        console.log(error);
    }
}

export async function deletePost (postId:string , imageId:string) {
    if(!postId || !imageId)  throw Error;

    try {
        await databases.deleteDocument(
            appwriteConfig.databaseid,
            appwriteConfig.postCollectionid,
            postId
        )
    } catch (error) {
        console.log(error);
        
    }
}

// Fetch Posts
export async function getInfinitePost( {pageParam } : {pageParam:number}) {

    const queries : any[] = [Query.orderDesc('$updatedAt'),Query.limit(10)]
    
    if(pageParam){
        queries.push(Query.cursorAfter(pageParam.toString()));
    }
    
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseid,
            appwriteConfig.postCollectionid,
            queries,
        )

        if(!posts) throw Error;

        return posts;
    } catch (error) {
        console.log(error);
    }
}

// Searching the post
export async function searchPost(searchTerm :string) {

    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseid,
            appwriteConfig.postCollectionid,
            [Query.search('caption',searchTerm)],
        )
        if(!posts) throw Error;

        return posts;
    } catch (error) {
        console.log(error);
    }
}