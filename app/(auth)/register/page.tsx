import { AuthExperience } from "@/app/components/auth/AuthExperience";
import { RegistrationForm } from "@/app/components/auth/RegistrationForm";
import { AuthPageRedirect } from "@/app/components/auth/AuthPageRedirect";

export default function RegisterPage() {
    return (
        <AuthPageRedirect>
            <AuthExperience mode="register">
                <RegistrationForm />
            </AuthExperience>
        </AuthPageRedirect>
    );
}
