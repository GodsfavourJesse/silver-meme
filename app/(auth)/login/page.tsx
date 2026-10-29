import { AuthExperience } from "@/app/components/auth/AuthExperience";
import { LoginForm } from "@/app/components/auth/LoginForm";

export default function LoginPage() {
    return (
        <AuthExperience mode="login">
            <LoginForm />
        </AuthExperience>
    );
}