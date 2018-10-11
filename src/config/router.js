export default {
    routes: [
        {
            route: ['', '/login'],
            name: 'login',
            moduleId: 'views/login-view/login-view',
            nav: false,
            auth: false,
            title: 'Login',
            settings: {
                t: 'login_route',
                roles: []
            }

        }, {
            route: '/nexus',
            name: 'nexus',
            moduleId: 'views/nexus-view/nexus-view',
            nav: true,
            auth: true,
            title: 'Nexus',
            settings: {
                t: 'nexus_route',
                roles: []
            }
        }, {
            route: '/reset-password',
            name: 'reset-password',
            moduleId: 'views/reset-password-view/reset-password-view',
            nav: true,
            auth: true,
            title: 'Reset Password',
            settings: {
                t: 'reset-password_route',
                roles: []
            }
        }, {
            route: '/logout',
            name: 'logout',
            moduleId: 'views/logout-view/logout-view',
            nav: true,
            auth: true,
            title: 'Logout',
            settings: {
                t: 'logout_route',
                roles: []
            }
        }
    ],
    fallbackRoute: 'login'
};
