import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

export default async function LoginPage(props: { searchParams?: Promise<{ error?: string }> }) {
  const searchParams = props.searchParams ? await props.searchParams : {}
  const error = searchParams.error

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-zinc-200">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-zinc-900">Admin Login</h2>
        </div>
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">
            Invalid credentials, please try again.
          </div>
        )}
        <form
          action={async (formData) => {
            "use server"
            const username = (formData.get("username") as string)?.trim();
            const password = (formData.get("password") as string)?.trim();
            try {
              console.log("Attempting sign in:", username);
              await signIn("credentials", { 
                username, 
                password,
                redirectTo: "/admin" 
              });
            } catch (error: any) {
              console.log("catch block fired:", error.name, error.message);
              // NEXT_REDIRECT is thrown by successful login
              if (error.message === 'NEXT_REDIRECT') {
                throw error;
              }
              if (error instanceof AuthError) {
                switch (error.type) {
                  case 'CredentialsSignin':
                    return redirect('/login?error=CredentialsSignin')
                  default:
                    return redirect('/login?error=UnknownError')
                }
              }
              throw error;
            }
          }}
          className="mt-8 space-y-6"
        >
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input id="username" name="username" type="text" required placeholder="admin" className="appearance-none rounded-none relative block w-full px-3 py-2 border border-zinc-300 placeholder-zinc-500 text-zinc-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input id="password" name="password" type="password" required placeholder="admin" className="appearance-none rounded-none relative block w-full px-3 py-2 border border-zinc-300 placeholder-zinc-500 text-zinc-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" />
            </div>
          </div>
          <div>
            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-zinc-900 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
