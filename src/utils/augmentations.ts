export {};

declare global {
  namespace Express {
    interface Request {
      //   currentUser?: User;
      email?: string;
      id?: string;
      ownerEmail?: string;
      ownerId?: string;
      isOwner?: boolean;
    }
  }
}
