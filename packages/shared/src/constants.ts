export const IS_SERVER = typeof window !== 'undefined';
export const DEBUG = process.env.NODE_ENV === 'development' || (IS_SERVER && window.location.search.includes('_vm_debug_'));