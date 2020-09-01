Vue.prototype.window = window

new Vue({
  el: "#app",
  data: {
    mode: 'anonymous',
    auth0: null, //Variable to control auth0
    isAuthenticated: false,
    user: {},
    alert: false,
    alertMessage: '',
  },
  async created() {
    try {
      await this.configureClient()
      this.reset()
      const query = window.location.search;
      if (query.includes("code=") && query.includes("state="))
        this.handleRedirectCallback();
      if (query.includes("error_description=")) {
        this.handleError({
          error_description: "Please verify your email before trying to login again"
        });
      }


    } catch (error) {
      this.handleError(error);
    }
  },
  methods: {
    //BEGIN Auth0 Methods
    handleError(error) {
      console.log(error);
      this.alert = true;
      this.alertMessage = error.error_description;
      window.history.replaceState({}, document.title, "/");
    },
    async configureClient() {
      let res = await axios.get('/auth_config.json')
      config = await res.data

      this.auth0 = await window.createAuth0Client({
        domain: config.domain,
        client_id: config.clientId
      });
    },
    async handleRedirectCallback() {
      await this.auth0.handleRedirectCallback();
      this.user = await this.auth0.getUser();
      this.isAuthenticated = true;
      this.updateUI();
      window.history.replaceState({}, document.title, "/");
    },
    async login() {
      await this.auth0.loginWithRedirect({
        redirect_uri: window.location.origin
      });
    },
    logout() {
      this.auth0.logout({
        returnTo: window.location.origin
      });
    },
    async updateUI() {
      if (this.isAuthenticated)
        this.setMode('authenticated')
      else
        this.setMode('anonymous')
    },
    //END Auth0 Methods
    setMode(mode) {
      this.mode = mode
    },
    reset() {
      this.setMode('anonymous')
    }
  }
});