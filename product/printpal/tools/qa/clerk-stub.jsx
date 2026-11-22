// QA-only stand-in for @clerk/react: always signed in as a fixed test user. Never used in the real app.
const user = {
  id: "user_qa",
  firstName: "Ravi",
  lastName: "Kumar",
  fullName: "Ravi Kumar",
  imageUrl: "",
  hasImage: false,
  primaryEmailAddress: { emailAddress: "ravi@srisaisigns.in" },
  emailAddresses: [{ emailAddress: "ravi@srisaisigns.in" }],
};
export const ClerkProvider = ({ children }) => children;
export const Show = ({ when, children }) => (when === "signed-in" ? children : null);
export const AuthenticateWithRedirectCallback = () => null;
export const SignIn = () => null;
export const SignUp = () => null;
export const useAuth = () => ({ getToken: async () => "qa-token", isSignedIn: true, isLoaded: true, userId: user.id });
export const useUser = () => ({ user, isLoaded: true, isSignedIn: true });
export const useClerk = () => ({ signOut: async () => {}, user });
