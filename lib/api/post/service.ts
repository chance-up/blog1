import axiosInstance from '../axios'
import { GetPostsRequest, GetPostsResponse } from './type'

export const getPosts = async (request: GetPostsRequest) => {
  const response = await axiosInstance.get<GetPostsResponse>('/api/posts', {
    params: request,
  })
  return response.data
}
