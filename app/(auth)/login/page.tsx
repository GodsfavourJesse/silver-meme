import { AuthExperience } from "@/app/components/auth/AuthExperience";
import { LoginForm } from "@/app/components/auth/LoginForm";
import { AuthPageRedirect } from "@/app/components/auth/AuthPageRedirect";

export default function LoginPage() {
    return (
        <AuthPageRedirect>
            <AuthExperience mode="login">
                <LoginForm />
            </AuthExperience>
        </AuthPageRedirect>
    );
}
