<template>
    <div class="login-container">
        <h2>登录</h2>
        <form @submit.prevent="login">
            <input v-model="username" placeholder="用户名" required />
            <input v-model="password" type="password" placeholder="密码" required />
            <button type="submit">登录</button>
        </form>
    </div>
</template>

<script>
export default {
    data() {
        return {
            username: '',
            password: ''
        };
    },
    methods: {
        login() {
            // 登录逻辑
            console.log('Logging in:', this.username);
        }
    }
}
</script>

<style scoped>
.login-container {
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

input {
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
