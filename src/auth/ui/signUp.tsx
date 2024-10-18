import { useForm } from "react-hook-form"
import supabase from "../../database/supabaseClient";
import { AuthProps } from "../../interface/AuthInterface";
import { Link, useNavigate } from "react-router-dom";


export default function SignUp() {

  const { register, handleSubmit } = useForm<AuthProps>();
  const navigate = useNavigate();

  async function handleSignUp(data: AuthProps) {
    if(data.password.length < 6) {
      alert("Password length must be minimum 6 letters");
    }
    if(data.email.length == 0 || data.password.length == 0) {
      alert('Please fill the required fields')
    }
    let { error } = await
      supabase.auth.signUp({
        email: data.email,
        password: data.password
      });

      if(error) {
        throw new Error("Error while signing up");
      } else {
        console.log('Success signing up');
        navigate('/auth/ui/signIn')
      }
  }

  return (
    <div className="h-screen flex justify-center items-start max-tablet:items-center max-mobile:items-center">
      <form onSubmit={handleSubmit(handleSignUp)} className="flex flex-col space-y-2 max-w-md p-4 max-tablet:w-4/5 max-mobile:w-11/12">
        <div className="text-xl">Create account to enter the study</div>
        <div className="text-xs">Don't worry. It will be quick :)</div>
        <input {...register("email", { required: "This is required"})} className="input input-primary input-bordered text-xs" type="email" placeholder="Email" />
        <input {...register("password", { required: "This is required"})} className="input input-primary input-bordered text-xs" type="password" placeholder="Password" />
        <input className="btn btn-primary" type="submit"/>
        <div className="text-xs text-center">Already have an account? <Link to='/auth/ui/signIn' className="text-xs underline">Sign In</Link></div>
      </form>
    </div>
  )
}
