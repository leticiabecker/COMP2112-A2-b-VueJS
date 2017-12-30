var app = new Vue({
  el: "#app",
  beforeMount: function () {
    this.initialize();
  },
  mounted: function () {
    this.gen = this.addEmails();
  },
  data: {
    emails: [],
    newEmails: [],
    selectedEmail: 0,
    currentFolder: 'inbox',
    filteredEmails: [],
    gen: ''
  },
  methods: {
    initialize: function () {

      // Check if 'emails' exists on localStorage
      if (localStorage.getItem('emails')) {

        // If true, use the emails from localStorage
        this.emails = JSON.parse(localStorage.getItem('emails'));

        // Filter them accordingly to the current folder
        this.filterFolder();

      } else {

        // Fetch emails from json file
        fetch("./js/data/emails.json")
          .then(res => res.json())
          .then(data => {
            this.emails = data;
            console.log(data);
            this.filterFolder();
          });

        // fetch("./js/data/newEmails.json")
        //   .then(res => res.json())
        //   .then(data => {
        //     this.newEmails = data;
        //     console.log(data);
        //     this.filterFolder();
        //   });

        async function receiveNewEmails() {
          const response = await fetch("./js/data/newEmails.json");
          const data = await response.json();
          app.newEmails = data;
          console.log(data);
          app.filterFolder();
        }
        receiveNewEmails();
      }
    },

    // Filter accordingly to the current folder
    filterFolder: function () {

      // If Inbox
      if (this.currentFolder === 'inbox') {

        // Check if there are still emails in the inbox and filter them
        if (this.emails.filter(email => email.deleted === false).length > 0) {
          // Update filteredEmails array
          this.filteredEmails = this.emails.filter(email => email.deleted === false);

        } else {

          // If there is no more emails in the inbox
          console.warn('no emails on inbox');

          // Update filteredEmails array
          this.filteredEmails = this.emails.filter(email => email.deleted === false);
        }

        // If Trash
      } else if (this.currentFolder === 'trash') {

        // Check if there are still emails in the trash and filter them
        if (this.emails.filter(email => email.deleted === true).length > 0) {
          // Update filteredEmails array
          this.filteredEmails = this.emails.filter(email => email.deleted === true);
          // selectEmail();

        } else {

          // If there is no more emails in the trash
          console.warn('no emails on trash');

          // Update filteredEmails array
          this.filteredEmails = this.emails.filter(email => email.deleted === true);
        }
      }
    },

    selectEmail: function (email, index) {

      // When an email on the list is clicked, check if it is not selected
      if (!this.selected()) {
        // Update selectedEmail using its index - it will update the main automatically
        this.selectedEmail = index;
      }
    },

    selected: function (index) {
      return index === this.selectedEmail;
    },

    addEmails: function* () {
      let indexEmails = 0;

      while (indexEmails < this.newEmails.length)
        yield this.newEmails[indexEmails++];
    },

    btn_addEmails: function () {
      let tempObj = this.gen.next() || {};

      // so as to prevent pushing an empty object
      tempObj.done ?
        console.warn("no more emails") :
        this.emails.unshift(tempObj.value);

      this.currentFolder === 'inbox';
      this.filterFolder();
    },

    deleteEmail: function (id) {
      // Get the email's index on the main Array using its id
      let emailIndex = this.emails.findIndex(e => e.id === id);

      // Check if the email already has the deleted property = true. 
      if (!this.emails[emailIndex].deleted) {
        // If not, set deleted = true
        this.$set(this.emails[emailIndex], "deleted", true);

        // Update local storage
        this.setLocalStorage();

        // Update view of inbox
        this.displayInbox();
        this.selectedEmail = 0;

      } else {
        // If the current game has the key/value deleted:true, set it to false (Recover from Trash)
        this.emails[emailIndex].deleted = false;

        // Update local storage
        this.setLocalStorage();

        // Update view
        this.displayTrash();
        this.selectedEmail = 0;
      }
    },

    displayTrash: function () {
      this.currentFolder = 'trash';
      this.selectedEmail = 0;
      this.filterFolder();
    },

    displayInbox: function () {
      this.currentFolder = 'inbox';
      this.selectedEmail = 0;
      this.filterFolder();
    },

    setLocalStorage: function () {
      // update state of emails array on localStorage
      localStorage.setItem('emails', JSON.stringify(this.emails));
    },

    isEmpty: function () {
      return this.filteredEmails.length === 0;
    }
  }
});