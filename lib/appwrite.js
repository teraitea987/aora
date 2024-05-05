import { Account, Avatars, Client, Databases, ID, Query } from "react-native-appwrite";

export const config = {
    endpoint: "https://cloud.appwrite.io/v1",
    platform: "com.stea.aora",
    projectId: "66377198002d3342db03",
    databaseId: "66377553000c4fc1517d",
    userCollectionId: "66377576003a75bc595a",
    videoCollectionId: "663775930016e8b94fc2",
    storageId: "663776b90001ef3b2593",
};
// Init your React Native SDK
const client = new Client();

client
    .setEndpoint(config.endpoint) // Your Appwrite Endpoint
    .setProject(config.projectId) // Your project ID
    .setPlatform(config.platform); // Your application ID or bundle ID.

const databases = new Databases(client);
const account = new Account(client);
const avatars = new Avatars(client);
// Register user
export async function createUser(email, password, username) {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        );

        if (!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(username);

        await signIn(email, password);

        const newUser = await databases.createDocument(
            config.databaseId,
            config.userCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email: email,
                username: username,
                avatar: avatarUrl,
            }
        );

        return newUser;
    } catch (error) {
        throw new Error(error);
    }
}

// Sign In
export const signIn = async (email, password) => {
    try {
        const session = await account.createEmailPasswordSession(
            email,
            password
        );

        return session;
    } catch (error) {
        throw new Error(error);
    }
}

// Get Account
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    throw new Error(error);
  }
}

export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      config.databaseId,
      config.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
}
