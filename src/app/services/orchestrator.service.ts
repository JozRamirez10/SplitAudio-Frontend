import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { API_ROUTES, APP, GENERAL } from "../constants/constants";
import { ActiveJobsDtoResponse, JobStatusResponse, JobSubmissionResponse, OrchestratorRequest } from "../models/dtos/orchestrator.model";

@Injectable({
    providedIn: 'root'
})
export class OrchestratorService {
    
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}${API_ROUTES.ORCHESTRATOR}`;

    getActiveJobs(): Observable<ActiveJobsDtoResponse> {
        return this.http.get<ActiveJobsDtoResponse>(`${this.apiUrl}${API_ROUTES.ACTIVE_JOBS}`);
    }

    getJobStatus(jobId: string): Observable<JobStatusResponse> {
        return this.http.get<JobStatusResponse>(
            `${this.apiUrl}${API_ROUTES.JOB_BY_ID}/${jobId}`
        );
    }

    splitAudio(file: File, email: string, tracksConfig: OrchestratorRequest)
        : Observable<JobSubmissionResponse> {

        const formData = this.buildBaseFormData(email, tracksConfig);
        formData.append(GENERAL.FILE, file);

        return this.http.post<JobSubmissionResponse>(
            `${this.apiUrl}${API_ROUTES.SPLIT_AUDIO}`,
            formData
        )
    }

    splitYoutube(url: string, email: string, tracksConfig: OrchestratorRequest)
        : Observable<JobSubmissionResponse> {

        const formData = this.buildBaseFormData(email, tracksConfig);
        formData.append(GENERAL.URL, url);

        return this.http.post<JobSubmissionResponse>(
            `${this.apiUrl}${API_ROUTES.SPLIT_YOUTUBE}`,
            formData
        );
    }

    private buildBaseFormData(email: string, tracksConfig: OrchestratorRequest) : FormData {
        const formData = new FormData();
        formData.append(GENERAL.EMAIL, email),
        formData.append(GENERAL.TRACKS, 
            new Blob([JSON.stringify(tracksConfig)], { type: APP.APP_JSON })
        );
        return formData;
    }
}