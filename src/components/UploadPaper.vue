<template>
    <div class="upload-container">
        <h2>上传论文</h2>
        <form @submit.prevent="upload">
            <input type="text" v-model="title" placeholder="论文标题" required />
            <input type="file" @change="handleFileUpload" required />
            <button type="submit">上传</button>
        </form>
    </div>
</template>

<script>
export default {
    data() {
        return {
            title: '',
            file: null
        };
    },
    methods: {
        handleFileUpload(event) {
            this.file = event.target.files[0];
        },
        upload() {
            console.log('Uploading paper:', this.title, this.file.name);
        }
    }
}
</script>

<style scoped>
.upload-container {
    max-width: 400px;
    margin: auto;
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
    text-align: center;
    color: #35424a;
}

input[type="text"], input[type="file"] {
    width: 100%;
    margin: 10px 0;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

button {
    width: 100%;
    padding: 10px;
    background: #35424a;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s;
}

button:hover {
    background: #f5a623;
}
</style>
