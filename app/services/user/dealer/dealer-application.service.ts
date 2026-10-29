import { apiRequest } from "@/app/lib/api/api-client";
import type {
    DealerApplication,
    MyDealerApplicationsResponse,
} from "@/app/types/user/dealer/dealer-application.types";

export async function getMyDealerApplications(): Promise<DealerApplication[]> {
    const response = await apiRequest<MyDealerApplicationsResponse>(
        "/dealer/applications/me",
    );

    return response.data.applications;

}