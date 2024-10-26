import { useForm } from "react-hook-form";
import supabase from "../../database/supabaseClient";
import { AuthProps } from "../../interface/AuthInterface";
import { Link, useNavigate } from "react-router-dom";


export default function SignIn() {

  const { register, handleSubmit } = useForm<AuthProps>();
  const navigate = useNavigate();

  async function handleSignIn(data: AuthProps) {
    let { error } = await
      supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if(error) {
        throw new Error("Error while signing up");
      } else {
        console.log('Success signing in');
        navigate('/surveyHome')
      }
  }

  return (
    <div className="h-full flex justify-center items-start max-tablet:items-center max-mobile:items-center">
      <form onSubmit={handleSubmit(handleSignIn)} className="flex flex-col space-y-2 max-w-md p-4 max-tablet:w-4/5 max-mobile:w-11/12">
        <div className="text-xl text-center">Sign in to enter the study</div>
        <input {...register("email", { required: "This is required" })} className="input input-primary input-bordered text-xs" type="email" placeholder="Email" />
        <input {...register("password", { required: "This is required" })} className="input input-primary input-bordered text-xs" type="password" placeholder="Password" />
        <input className="btn btn-primary" type="submit" />
        <div className="text-xs text-center">Don't have an account? <Link to='/auth/ui/signUp' className="text-xs underline">Create account</Link></div>
      </form>
    </div>
  )
}
