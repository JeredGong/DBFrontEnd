import { createRouter, createWebHistory } from 'vue-router';
import Login from './components/Login.vue';
import PaperList from './components/Collection.vue';
import UploadPaper from './components/UploadPaper.vue';
import Home from './components/Home.vue';
const routes = [
    { path: '/', component: Home  },
    { path: '/books', component: PaperList },
    { path: '/login', component: Login },
    { path: '/upload', component: UploadPaper }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
