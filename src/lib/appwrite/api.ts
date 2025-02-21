import { INewUser } from "@/types";
import {ID, Query} from 'appwrite'
import { account, appwriteConfig, avatars, databases } from "./config";

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