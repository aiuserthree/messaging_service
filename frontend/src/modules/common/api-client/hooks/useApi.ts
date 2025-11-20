import { useMutation, useQuery, UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import { apiClient, ApiResponse } from "../client/axiosClient";

export function useApiQuery<T>(
  key: string[],
  url: string,
  options?: UseQueryOptions<ApiResponse<T>>
) {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const response = await apiClient.get<T>(url);
      if (!response.success) {
        throw new Error(response.error?.message || "API 호출 실패");
      }
      return response.data;
    },
    ...options,
  });
}

export function useApiMutation<TData, TVariables>(
  url: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE" = "POST",
  options?: UseMutationOptions<ApiResponse<TData>, Error, TVariables>
) {
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      let response: ApiResponse<TData>;

      switch (method) {
        case "POST":
          response = await apiClient.post<TData>(url, variables);
          break;
        case "PUT":
          response = await apiClient.put<TData>(url, variables);
          break;
        case "PATCH":
          response = await apiClient.patch<TData>(url, variables);
          break;
        case "DELETE":
          response = await apiClient.delete<TData>(url);
          break;
      }

      if (!response.success) {
        throw new Error(response.error?.message || "API 호출 실패");
      }

      return response.data;
    },
    ...options,
  });
}

