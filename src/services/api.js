import axios from 'axios';

export const getSiteList = () => axios.get('/api/sites');
export const getSite = (id) => axios.get(`/api/sites/${id}`);
export const createSite = (data) => axios.post('/api/sites', data);
export const updateSite = (id, data) => axios.put(`/api/sites/${id}`, data);
export const deleteSite = (id) => axios.delete(`/api/sites/${id}`);

export const getBlocks = () => axios.get('/api/blocks');
export const getBlocksBySite = (sid) => axios.get(`/api/blocks?siteId=${sid}`);
export const getBlock = (id) => axios.get(`/api/blocks/${id}`);
export const createBlock = (data) => axios.post('/api/blocks', data);
export const updateBlock = (id, data) => axios.put(`/api/blocks/${id}`, data);
export const deleteBlock = (id) => axios.delete(`/api/blocks/${id}`);