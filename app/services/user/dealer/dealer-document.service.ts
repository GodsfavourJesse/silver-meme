import { dealerService } from "./dealer.service";

import type {
    DealerDocumentUrlResponse,
    DeleteDealerDocumentResponse,
    GetDealerDocumentsResponse,
    UploadDealerDocumentInput,
    UploadDealerDocumentResponse,
} from "@/app/types/user/dealer/dealer.types";

export const dealerDocumentService = {
    getDocuments(
        applicationId: string,
    ): Promise<GetDealerDocumentsResponse> {
        return dealerService.getDealerDocuments(applicationId);
    },

    upload(
        input: UploadDealerDocumentInput,
    ): Promise<UploadDealerDocumentResponse> {
        return dealerService.uploadDealerDocument(input);
    },

    getDocumentUrl(
        documentId: string,
    ): Promise<DealerDocumentUrlResponse> {
        return dealerService.getDealerDocumentUrl(documentId);
    },

    remove(
        documentId: string,
    ): Promise<DeleteDealerDocumentResponse> {
        return dealerService.deleteDealerDocument(documentId);
    },
};