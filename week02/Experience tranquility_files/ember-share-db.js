'use strict';



;define('ember-share-db/adapters/account', ['exports', 'ember-data', 'ember-simple-auth/mixins/data-adapter-mixin', 'ember-share-db/config/environment'], function (exports, _emberData, _dataAdapterMixin, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  const { JSONAPIAdapter } = _emberData.default;

  exports.default = JSONAPIAdapter.extend(_dataAdapterMixin.default, {
    host: _environment.default.serverHost,
    session: Ember.inject.service('session'),
    headers: Ember.computed('session.data.authenticated.access_token', function () {
      const headers = {};
      if (this.session.isAuthenticated) {
        headers['Authorization'] = `Bearer ${this.session.data.authenticated.access_token}`;
      }

      return headers;
    })
    // authorize(xhr) {
    //   let { access_token } = this.get('session.data.authenticated');
    //   xhr.setRequestHeader('Authorization', `Bearer ${access_token}`);
    // },
  });
});
;define('ember-share-db/adapters/document', ['exports', 'ember-data', 'ember-share-db/config/environment'], function (exports, _emberData, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberData.default.JSONAPIAdapter.extend({
    host: _environment.default.serverHost,
    sessionAccount: Ember.inject.service('session-account'),
    headers: Ember.computed('sessionAccount.bearerToken', function () {
      return {
        'Authorization': 'Bearer ' + this.get('sessionAccount.bearerToken')
      };
    })
  });
});
;define('ember-share-db/app', ['exports', 'ember-share-db/resolver', 'ember-load-initializers', 'ember-share-db/config/environment'], function (exports, _resolver, _emberLoadInitializers, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  const App = Ember.Application.extend({
    modulePrefix: _environment.default.modulePrefix,
    podModulePrefix: _environment.default.podModulePrefix,
    Resolver: _resolver.default
  });

  (0, _emberLoadInitializers.default)(App, _environment.default.modulePrefix);

  exports.default = App;
});
;define('ember-share-db/authenticators/oauth2', ['exports', 'ember-simple-auth/authenticators/oauth2-password-grant', 'ember-share-db/config/environment'], function (exports, _oauth2PasswordGrant, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _oauth2PasswordGrant.default.extend({
    serverTokenEndpoint: `${_environment.default.oauthHost}/token`,
    serverTokenRevocationEndpoint: `${_environment.default.oauthHost}/revoke`,
    cs: Ember.inject.service('console'),
    authenticate(identification, password, scope = [], headers = {}) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        this.get('cs').log("trying to authenticate");
        const data = { 'grant_type': 'password', username: identification, password };
        const serverTokenEndpoint = this.get('serverTokenEndpoint');
        const useResponse = this.get('rejectWithResponse');
        const scopesString = Ember.makeArray(scope).join(' ');
        if (!Ember.isEmpty(scopesString)) {
          data.scope = scopesString;
        }
        this.makeRequest(serverTokenEndpoint, data, headers).then(response => {
          Ember.run(() => {
            this.get('cs').log(response);
            if (!this._validate(response)) {
              this.get('cs').log('access_token is missing in server response');
              reject('access_token is missing in server response');
            }

            const expiresAt = this._absolutizeExpirationTime(response['expires_in']);
            this._scheduleAccessTokenRefresh(response['expires_in'], expiresAt, response['refresh_token']);
            if (!Ember.isEmpty(expiresAt)) {
              response = Ember.assign(response, { 'expires_at': expiresAt });
            }
            response = Ember.assign(response, { 'user_id': identification });
            resolve(response);
          });
        }, response => {
          Ember.run(null, reject, useResponse ? response : response.responseJSON || response.responseText);
        });
      });
    },
    makeRequest: function (url, data) {
      var client_id = 'application';
      var client_secret = 'secret';
      return Ember.$.ajax({
        url: this.serverTokenEndpoint,
        type: 'POST',
        data: data,
        contentType: 'application/x-www-form-urlencoded',
        headers: {
          Authorization: "Basic " + btoa(client_id + ":" + client_secret)
        }
      });
    }
  });
});
;define('ember-share-db/components/about-description', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    mediaQueries: Ember.inject.service(),
    colours: Ember.computed(() => {
      return ["#ED3D05F2", "#FFCE00F2", "#0ED779F2", "#F79994F2", "#4D42EBF2"];
    }),
    docURL: _environment.default.localOrigin + "/getting-started/beginner",
    didRender() {
      this._super(...arguments);
      let colour1 = Math.floor(Math.random() * 5);
      let colour2 = Math.floor(Math.random() * 5);
      while (colour2 == colour1) {
        colour2 = Math.floor(Math.random() * 5);
      }
      document.getElementById('about-overlay-title').style['background-color'] = this.get('colours')[colour1];
      const desc = document.getElementById("about-overlay-desc");
      if (!Ember.isEmpty(desc)) {
        desc.style['background-color'] = this.get('colours')[colour2];
      }
    }
  });
});
;define('ember-share-db/components/audio-classifier-guide', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({});
});
;define('ember-share-db/components/autopilot-guide', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({});
});
;define('ember-share-db/components/base-token', ['exports', 'ember-share-db/templates/components/base-token'], function (exports, _baseToken) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    //Component properties
    layout: _baseToken.default, // For more info: https://discuss.emberjs.com/t/layout-property-for-declaring-html-in-component/12844/2
    classNames: ['uncharted-token'],
    classNameBindings: ['isSelected:uncharted-selected-token'],
    didUpdateAttrs() {
      this._super(...arguments);
    },
    // Properties
    token: null,
    index: null,
    selectedTokenIndex: null,
    canDelete: true,
    // State
    isSelected: Ember.computed('index', 'selectedTokenIndex', function () {
      return this.get('index') === this.get('selectedTokenIndex');
    }),

    // Actions
    actions: {
      removeToken() {
        this.removeToken();
      },
      selectToken() {
        console.log("CAN DELETE?", this.get('canDelete'));
        if (!this.get('canDelete')) {
          console.log("mouseDown");
          this.mouseDown();
        }
      },
      onDelete() {
        this.removeToken();
      }
    }
  });
});
;define('ember-share-db/components/bbcut-guide', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({});
});
;define('ember-share-db/components/bs-accordion', ['exports', 'ember-bootstrap/components/bs-accordion'], function (exports, _bsAccordion) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _bsAccordion.default;
    }
  });
});
;define('ember-share-db/components/bs-accordion/item', ['exports', 'ember-bootstrap/components/bs-accordion/item'], function (exports, _item) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _item.default;
    }
  });
});
;define('ember-share-db/components/bs-accordion/item/body', ['exports', 'ember-bootstrap/components/bs-accordion/item/body'], function (exports, _body) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _body.default;
    }
  });
});
;define('ember-share-db/components/bs-accordion/item/title', ['exports', 'ember-bootstrap/components/bs-accordion/item/title'], function (exports, _title) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _title.default;
    }
  });
});
;define('ember-share-db/components/bs-alert', ['exports', 'ember-bootstrap/components/bs-alert'], function (exports, _bsAlert) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _bsAlert.default;
    }
  });
});
;define('ember-share-db/components/bs-button-group', ['exports', 'ember-bootstrap/components/bs-button-group'], function (exports, _bsButtonGroup) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _bsButtonGroup.default;
    }
  });
});
;define('ember-share-db/components/bs-button-group/button', ['exports', 'ember-bootstrap/components/bs-button-group/button'], function (exports, _button) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _button.default;
    }
  });
});
;define('ember-share-db/components/bs-button', ['exports', 'ember-bootstrap/components/bs-button'], function (exports, _bsButton) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _bsButton.default;
    }
  });
});
;define('ember-share-db/components/bs-carousel', ['exports', 'ember-bootstrap/components/bs-carousel'], function (exports, _bsCarousel) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _bsCarousel.default;
    }
  });
});
;define('ember-share-db/components/bs-carousel/slide', ['exports', 'ember-bootstrap/components/bs-carousel/slide'], function (exports, _slide) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _slide.default;
    }
  });
});
;define('ember-share-db/components/bs-collapse', ['exports', 'ember-bootstrap/components/bs-collapse'], function (exports, _bsCollapse) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _bsCollapse.default;
    }
  });
});
;define('ember-share-db/components/bs-dropdown', ['exports', 'ember-bootstrap/components/bs-dropdown'], function (exports, _bsDropdown) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _bsDropdown.default;
    }
  });
});
;define('ember-share-db/components/bs-dropdown/button', ['exports', 'ember-bootstrap/components/bs-dropdown/button'], function (exports, _button) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _button.default;
    }
  });
});
;define('ember-share-db/components/bs-dropdown/menu', ['exports', 'ember-bootstrap/components/bs-dropdown/menu'], function (exports, _menu) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _menu.default;
    }
  });
});
;define('ember-share-db/components/bs-dropdown/menu/divider', ['exports', 'ember-bootstrap/components/bs-dropdown/menu/divider'], function (exports, _divider) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _divider.default;
    }
  });
});
;define('ember-share-db/components/bs-dropdown/menu/item', ['exports', 'ember-bootstrap/components/bs-dropdown/menu/item'], function (exports, _item) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _item.default;
    }
  });
});
;define('ember-share-db/components/bs-dropdown/menu/link-to', ['exports', 'ember-bootstrap/components/bs-dropdown/menu/link-to'], function (exports, _linkTo) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _linkTo.default;
    }
  });
});
;define('ember-share-db/components/bs-dropdown/toggle', ['exports', 'ember-bootstrap/components/bs-dropdown/toggle'], function (exports, _toggle) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _toggle.default;
    }
  });
});
;define('ember-share-db/components/bs-form', ['exports', 'ember-bootstrap/components/bs-form'], function (exports, _bsForm) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _bsForm.default;
    }
  });
});
;define('ember-share-db/components/bs-form/element', ['exports', 'ember-bootstrap/components/bs-form/element'], function (exports, _element) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _element.default;
    }
  });
});
;define('ember-share-db/components/bs-form/element/control', ['exports', 'ember-bootstrap/components/bs-form/element/control'], function (exports, _control) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _control.default;
    }
  });
});
;define('ember-share-db/components/bs-form/element/control/checkbox', ['exports', 'ember-bootstrap/components/bs-form/element/control/checkbox'], function (exports, _checkbox) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _checkbox.default;
    }
  });
});
;define('ember-share-db/components/bs-form/element/control/input', ['exports', 'ember-bootstrap/components/bs-form/element/control/input'], function (exports, _input) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _input.default;
    }
  });
});
;define('ember-share-db/components/bs-form/element/control/radio', ['exports', 'ember-bootstrap/components/bs-form/element/control/radio'], function (exports, _radio) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _radio.default;
    }
  });
});
;define('ember-share-db/components/bs-form/element/control/textarea', ['exports', 'ember-bootstrap/components/bs-form/element/control/textarea'], function (exports, _textarea) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _textarea.default;
    }
  });
});
;define('ember-share-db/components/bs-form/element/errors', ['exports', 'ember-bootstrap/components/bs-form/element/errors'], function (exports, _errors) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _errors.default;
    }
  });
});
;define('ember-share-db/components/bs-form/element/feedback-icon', ['exports', 'ember-bootstrap/components/bs-form/element/feedback-icon'], function (exports, _feedbackIcon) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _feedbackIcon.default;
    }
  });
});
;define('ember-share-db/components/bs-form/element/help-text', ['exports', 'ember-bootstrap/components/bs-form/element/help-text'], function (exports, _helpText) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _helpText.default;
    }
  });
});
;define('ember-share-db/components/bs-form/element/label', ['exports', 'ember-bootstrap/components/bs-form/element/label'], function (exports, _label) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _label.default;
    }
  });
});
;define('ember-share-db/components/bs-form/element/layout/horizontal', ['exports', 'ember-bootstrap/components/bs-form/element/layout/horizontal'], function (exports, _horizontal) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _horizontal.default;
    }
  });
});
;define('ember-share-db/components/bs-form/element/layout/horizontal/checkbox', ['exports', 'ember-bootstrap/components/bs-form/element/layout/horizontal/checkbox'], function (exports, _checkbox) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _checkbox.default;
    }
  });
});
;define('ember-share-db/components/bs-form/element/layout/inline', ['exports', 'ember-bootstrap/components/bs-form/element/layout/inline'], function (exports, _inline) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _inline.default;
    }
  });
});
;define('ember-share-db/components/bs-form/element/layout/inline/checkbox', ['exports', 'ember-bootstrap/components/bs-form/element/layout/inline/checkbox'], function (exports, _checkbox) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _checkbox.default;
    }
  });
});
;define('ember-share-db/components/bs-form/element/layout/vertical', ['exports', 'ember-bootstrap/components/bs-form/element/layout/vertical'], function (exports, _vertical) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _vertical.default;
    }
  });
});
;define('ember-share-db/components/bs-form/element/layout/vertical/checkbox', ['exports', 'ember-bootstrap/components/bs-form/element/layout/vertical/checkbox'], function (exports, _checkbox) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _checkbox.default;
    }
  });
});
;define('ember-share-db/components/bs-form/group', ['exports', 'ember-bootstrap/components/bs-form/group'], function (exports, _group) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _group.default;
    }
  });
});
;define('ember-share-db/components/bs-modal-simple', ['exports', 'ember-bootstrap/components/bs-modal-simple'], function (exports, _bsModalSimple) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _bsModalSimple.default;
    }
  });
});
;define('ember-share-db/components/bs-modal', ['exports', 'ember-bootstrap/components/bs-modal'], function (exports, _bsModal) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _bsModal.default;
    }
  });
});
;define('ember-share-db/components/bs-modal/body', ['exports', 'ember-bootstrap/components/bs-modal/body'], function (exports, _body) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _body.default;
    }
  });
});
;define('ember-share-db/components/bs-modal/dialog', ['exports', 'ember-bootstrap/components/bs-modal/dialog'], function (exports, _dialog) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _dialog.default;
    }
  });
});
;define('ember-share-db/components/bs-modal/footer', ['exports', 'ember-bootstrap/components/bs-modal/footer'], function (exports, _footer) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _footer.default;
    }
  });
});
;define('ember-share-db/components/bs-modal/header', ['exports', 'ember-bootstrap/components/bs-modal/header'], function (exports, _header) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _header.default;
    }
  });
});
;define('ember-share-db/components/bs-modal/header/close', ['exports', 'ember-bootstrap/components/bs-modal/header/close'], function (exports, _close) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _close.default;
    }
  });
});
;define('ember-share-db/components/bs-modal/header/title', ['exports', 'ember-bootstrap/components/bs-modal/header/title'], function (exports, _title) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _title.default;
    }
  });
});
;define('ember-share-db/components/bs-nav', ['exports', 'ember-bootstrap/components/bs-nav'], function (exports, _bsNav) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _bsNav.default;
    }
  });
});
;define('ember-share-db/components/bs-nav/item', ['exports', 'ember-bootstrap/components/bs-nav/item'], function (exports, _item) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _item.default;
    }
  });
});
;define('ember-share-db/components/bs-nav/link-to', ['exports', 'ember-bootstrap/components/bs-nav/link-to'], function (exports, _linkTo) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _linkTo.default;
    }
  });
});
;define('ember-share-db/components/bs-navbar', ['exports', 'ember-bootstrap/components/bs-navbar'], function (exports, _bsNavbar) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _bsNavbar.default;
    }
  });
});
;define('ember-share-db/components/bs-navbar/content', ['exports', 'ember-bootstrap/components/bs-navbar/content'], function (exports, _content) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _content.default;
    }
  });
});
;define('ember-share-db/components/bs-navbar/link-to', ['exports', 'ember-bootstrap/components/bs-navbar/link-to'], function (exports, _linkTo) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _linkTo.default;
    }
  });
});
;define('ember-share-db/components/bs-navbar/nav', ['exports', 'ember-bootstrap/components/bs-navbar/nav'], function (exports, _nav) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _nav.default;
    }
  });
});
;define('ember-share-db/components/bs-navbar/toggle', ['exports', 'ember-bootstrap/components/bs-navbar/toggle'], function (exports, _toggle) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _toggle.default;
    }
  });
});
;define('ember-share-db/components/bs-popover', ['exports', 'ember-bootstrap/components/bs-popover'], function (exports, _bsPopover) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _bsPopover.default;
    }
  });
});
;define('ember-share-db/components/bs-popover/element', ['exports', 'ember-bootstrap/components/bs-popover/element'], function (exports, _element) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _element.default;
    }
  });
});
;define('ember-share-db/components/bs-progress', ['exports', 'ember-bootstrap/components/bs-progress'], function (exports, _bsProgress) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _bsProgress.default;
    }
  });
});
;define('ember-share-db/components/bs-progress/bar', ['exports', 'ember-bootstrap/components/bs-progress/bar'], function (exports, _bar) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _bar.default;
    }
  });
});
;define('ember-share-db/components/bs-tab', ['exports', 'ember-bootstrap/components/bs-tab'], function (exports, _bsTab) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _bsTab.default;
    }
  });
});
;define('ember-share-db/components/bs-tab/pane', ['exports', 'ember-bootstrap/components/bs-tab/pane'], function (exports, _pane) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _pane.default;
    }
  });
});
;define('ember-share-db/components/bs-tooltip', ['exports', 'ember-bootstrap/components/bs-tooltip'], function (exports, _bsTooltip) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _bsTooltip.default;
    }
  });
});
;define('ember-share-db/components/bs-tooltip/element', ['exports', 'ember-bootstrap/components/bs-tooltip/element'], function (exports, _element) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _element.default;
    }
  });
});
;define('ember-share-db/components/check-box', ['exports', 'ember-railio-grid/components/check-box'], function (exports, _checkBox) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _checkBox.default;
    }
  });
});
;define('ember-share-db/components/code-mirror', ['exports', 'htmlhint', 'codemirror', 'jshint'], function (exports, _htmlhint, _codemirror, _jshint) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    autocomplete: Ember.inject.service('autocomplete'),
    fontSize: 14,
    cs: Ember.inject.service('console'),
    shiftDown: false,
    evalDown: false,
    didInsertElement() {
      this._super(...arguments);
      const myTextArea = this.element.querySelector("#code-mirror-container");
      const editor = _codemirror.default.fromTextArea(myTextArea, {
        mode: "htmlmixed",
        theme: "monokai",
        lineWrapping: true,
        readOnly: true,
        lineNumbers: true,
        matchBrackets: true,
        autoCloseTags: true,
        autocomplete: true,
        foldGutter: true,
        autorefresh: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
      });
      editor.on("keydown", (cm, event) => {
        //this.get('cs').log("KEY", event.keyCode);
        //17 = ctrl, 16 = shift, apple cmd = 224 | 91 | 93,
        if (!cm.state.completionActive && !cm.options.readOnly) {
          if (event.keyCode == 16) {
            this.set('shiftDown', true);
          }
          if (event.keyCode == 17 || event.keyCode == 224 || event.keyCode == 91 || event.keyCode == 93) {
            this.set('evalDown', true);
          }
          if (this.get('evalDown') && this.get('shiftDown')) {
            //this.onReevaluate();
          }
        }
      });
      editor.on("keyup", (cm, event) => {
        //console.log("KEY", event.keyCode);
        if (!cm.state.completionActive && !cm.options.readOnly) {
          if (event.keyCode == 16) {
            this.set('shiftDown', false);
          }
          if (event.keyCode == 17 || event.keyCode == 224 || event.keyCode == 91 || event.keyCode == 93) {
            this.set('evalDown', false);
          }
        }

        if (!cm.state.completionActive && !cm.options.readOnly && event.keyCode > 31 && event.keyCode != 9 //tab
        && event.keyCode != 8 && event.keyCode != 32 && event.keyCode != 13 && event.keyCode != 37 && event.keyCode != 38 && event.keyCode != 39 && event.keyCode != 40 && event.keyCode != 224 //apple cmd
        ) {
            let cursor = cm.getCursor(),
                line = cm.getLine(cursor.line);
            let start = cursor.ch,
                end = cursor.ch;
            let from, to;
            while (start && /\w/.test(line.charAt(start - 1))) --start;
            while (end < line.length && /\w/.test(line.charAt(end))) ++end;
            var word = line.slice(start, end).toLowerCase();
            if (word.length > 1) {
              cm.showHint({ completeSingle: false });
            }
          }
      });
      editor.setOption("extraKeys", {
        "Ctrl-Space": "autocomplete",
        "Cmd-\=": cm => {
          let elements = document.getElementsByClassName("CodeMirror");
          const currentFontSize = parseInt(elements[0].style.fontSize.substring(0, 2));
          elements[0].style.fontSize = currentFontSize + 1 + "pt";
        },
        "Cmd--": cm => {
          let elements = document.getElementsByClassName("CodeMirror");
          const currentFontSize = parseInt(elements[0].style.fontSize.substring(0, 2));
          elements[0].style.fontSize = currentFontSize - 1 + "pt";
        },
        "Cmd-Enter": cm => {
          this.get('cs').log("shift-cmd");
          this.onReevaluate();
        },
        "Ctrl-Enter": cm => {
          this.get('cs').log("shift-Ctrl");
          this.onReevaluate();
        },
        "Cmd-/": cm => {
          cm.toggleComment();
          console.log("COMMENT");
        }
      });
      var widgets = [];
      var waiting;

      let updateHints = () => {
        editor.operation(() => {
          for (var i = 0; i < widgets.length; ++i) {
            editor.setGutterMarker(widgets[i], "CodeMirror-linenumbers", null);
          }
          var doc = editor.getDoc();
          var pos = doc.getCursor();
          var mode = editor.getMode().name;
          widgets.length = 0;
          const ruleSets = this.get('autocomplete').ruleSets(mode);

          let src = editor.getValue();
          if (mode == "javascript") {
            //Add script tags around javascript to force js linting
            src = "<script>" + editor.getValue() + "</script>";
          } else if (mode == "css") {
            //Add style tags around css to force css linting
            src = "<style>" + editor.getValue() + "</style>";
          }
          var messages = _htmlhint.default.HTMLHint.verify(src, ruleSets);
          //collate all errors on the same line together
          var lines = {};
          for (i = 0; i < messages.length; ++i) {
            let err = messages[i];
            //HTMLHint misclassifies this, ignore
            if (err.message != "Tag must be paired, no start tag: [ </input> ]" && err.message != "Unnecessary semicolon.") {
              if (!Ember.isEmpty(lines[err.line])) {
                lines[err.line] = lines[err.line] + "\n" + err.message;
              } else {
                lines[err.line] = err.message;
              }
            }
          }
          //this.get('cs').log("lines",lines);
          for (let line in lines) {
            if (lines.hasOwnProperty(line)) {
              let msg = document.createElement("div");
              msg.style["background-color"] = "transparent";
              msg.style["width"] = "1000px";
              msg.style["height"] = "100%";
              let icon = msg.appendChild(document.createElement("div"));
              icon.innerHTML = "!!";
              icon.className = "lint-error-icon";

              let txt = document.createElement("div");
              txt.innerHTML = lines[line];
              txt.style.display = "none";
              msg.appendChild(txt);
              msg.className = "lint-error";
              icon.onmouseover = () => {
                this.get('cs').log("over");
                msg.style["background-color"] = "rgba(255,255,255,0.8)";
                txt.style.display = "inline";
              };
              icon.onmouseout = () => {
                msg.style["background-color"] = "transparent";
                txt.style.display = "none";
              };
              //widgets.push(editor.addLineWidget(parseInt(line) - 1, msg, {coverGutter: true, noHScroll: true}));
              widgets.push(editor.setGutterMarker(parseInt(line) - 1, "CodeMirror-linenumbers", msg));
            }
          }
        });
      };

      setTimeout(updateHints, 100);

      editor.on('changes', (cm, change) => {
        this.onChange(cm, change);
        clearTimeout(waiting);
        waiting = setTimeout(updateHints, 500);
      });
      this.set('codemirror', editor);

      this.onReady(editor);
    }
  });
});
;define('ember-share-db/components/colab-guide', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    url: _environment.default.localOrigin
  });
});
;define('ember-share-db/components/conceptular-guide', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({});
});
;define('ember-share-db/components/data-actions', ['exports', 'ember-railio-grid/components/data-actions'], function (exports, _dataActions) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _dataActions.default;
    }
  });
});
;define('ember-share-db/components/data-col', ['exports', 'ember-railio-grid/components/data-col'], function (exports, _dataCol) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _dataCol.default;
    }
  });
});
;define('ember-share-db/components/data-grid', ['exports', 'ember-railio-grid/components/data-grid'], function (exports, _dataGrid) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _dataGrid.default;
    }
  });
});
;define('ember-share-db/components/data-row', ['exports', 'ember-railio-grid/components/data-row'], function (exports, _dataRow) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _dataRow.default;
    }
  });
});
;define('ember-share-db/components/document-list-item', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    document: null,
    documentService: Ember.inject.service('documents'),
    store: Ember.inject.service('store'),
    cs: Ember.inject.service('console'),
    sessionAccount: Ember.inject.service('session-account'),
    canEdit: Ember.computed('document', function () {
      return this.get('sessionAccount').currentUserName == this.get('document').owner;
    }),
    doPlay: Ember.computed('document', function () {
      return !this.get('document').dontPlay;
    }),
    index: 0,
    actions: {
      open() {
        this.get('onOpen')(this.get('document').documentId);
      },
      delete() {
        this.get('onDelete')(this.get('document').documentId);
      },
      toggleDontPlay() {
        const docId = this.get('document').documentId;
        this.get('store').findRecord('document', docId).then(doc => {
          const toggled = !doc.data.dontPlay;
          const op = { p: ["dontPlay"], oi: toggled ? "true" : "false" };
          this.get('documentService').submitOp(op, docId);
        }).catch(err => {
          this.get('cs').log("ERROR", err);
        });
      }
    }
  });
});
;define('ember-share-db/components/download-button', ['exports', 'ember-cli-file-saver/mixins/file-saver', 'jszip'], function (exports, _fileSaver, _jszip) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend(_fileSaver.default, {
    doc: null,
    classNames: ['inline-view'],
    assetService: Ember.inject.service('assets'),
    store: Ember.inject.service('store'),
    documentService: Ember.inject.service('documents'),
    cs: Ember.inject.service('console'),
    actions: {
      download() {
        const data = this.get('doc');
        this.get('cs').log(data);
        let zip = new _jszip.default();
        this.get('documentService').getCombinedSource(data.id).then(source => {
          zip.file("index.html", source, { type: 'string' });
          for (let asset of data.assets) {
            const storeAsset = this.get('store').peekRecord('asset', asset.fileId);
            if (storeAsset) {
              zip.file(asset.name, storeAsset.b64data, { base64: true });
            }
          }
          zip.generateAsync({ type: "blob" }).then(blob => {
            this.saveFileAs(data.name + "-MIMIC.zip", blob, 'application/zip');
          });
        }).catch(err => this.get('cs').log(err));
      }
    }
  });
});
;define('ember-share-db/components/embedded-project', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    docId: "",
    cs: Ember.inject.service('console'),
    url: _environment.default.localOrigin,
    height: "490px",
    loaded: false,
    manualLoad: false,
    srcURL: "about:none",
    buttonTop: Ember.computed('height', function () {
      let height = this.get('height');
      height = height.substring(0, height.length - 2);
      height = parseInt(height);
      return height / 2 + "px";
    }),
    didInsertElement() {
      this._super(...arguments);
      if (!this.get('manualLoad')) {
        this.observe();
      }
    },
    observe: function () {
      var options = {
        root: document.querySelector('#scrollArea')
      };

      var observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {

          if (!this.get('loaded')) {
            //If onscreen
            if (entry.intersectionRatio > 0) {
              this.set("doLoad", true);
              setTimeout(() => {
                //Wait until it has been onscreen for 1 sec before loading
                if (this.get("doLoad")) {
                  let src = this.get("url") + "/code/" + this.get("docId") + "?embed=true&showCode=true";
                  this.get("cs").log("onscreen", src);
                  this.set("srcURL", src);
                  this.set("loaded", true);
                }
              }, 1000);
            }
          }
          if (entry.intersectionRatio <= 0) {
            //if offscreen before timeout occurs, cancel loading
            this.set("doLoad", false);
            this.get("cs").log("offscreen", this.get("docId"));
          }
        });
      }, options);

      observer.observe(document.getElementById(this.elementId));
    },
    actions: {
      loadProject() {
        this.set("manualLoad", false);
        let src = this.get("url") + "/code/" + this.get("docId") + "?embed=true&showCode=true";
        this.set("srcURL", src);
        this.set("loaded", true);
      }
    }
  });
});
;define('ember-share-db/components/ember-ace-completion-tooltip', ['exports', 'ember-ace/components/ember-ace-completion-tooltip'], function (exports, _emberAceCompletionTooltip) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _emberAceCompletionTooltip.default;
    }
  });
});
;define('ember-share-db/components/ember-ace', ['exports', 'ember-ace/components/ember-ace'], function (exports, _emberAce) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _emberAce.default;
    }
  });
});
;define('ember-share-db/components/ember-popper-targeting-parent', ['exports', 'ember-popper/components/ember-popper-targeting-parent'], function (exports, _emberPopperTargetingParent) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _emberPopperTargetingParent.default;
    }
  });
});
;define('ember-share-db/components/ember-popper', ['exports', 'ember-popper/components/ember-popper'], function (exports, _emberPopper) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _emberPopper.default;
    }
  });
});
;define('ember-share-db/components/evolib-example-guide', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({});
});
;define('ember-share-db/components/evolib-guide', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({});
});
;define('ember-share-db/components/example-tile', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    example: "",
    description: Ember.computed('example', function () {
      return this.get('example').desc;
    }),
    isSelected: false,
    store: Ember.inject.service('store'),
    docid: Ember.computed('example', function () {
      return this.get('example').docid;
    }),
    index: 0,
    thumbnailUrl: Ember.computed('example', function () {
      return _environment.default.localOrigin + "/images/" + this.get('example').thumbnailId;
    }),
    colourId: Ember.computed('index', function () {
      return "tile" + this.get('index') % 5;
    }),
    didReceiveAttrs() {
      this._super(...arguments);
      this.get('store').findRecord('document', this.get('example').docid).then(doc => {
        this.set('name', doc.get('name'));
        this.set('tags', doc.get('tags'));
      });
    },
    actions: {
      onClick() {
        this.get('onClick')(this.get("example"));
      },
      onover() {
        this.set('isSelected', true);
      },
      onout() {
        this.set('isSelected', false);
      }
    }
  });
});
;define('ember-share-db/components/face-synth-guide', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({});
});
;define('ember-share-db/components/file-field', ['exports', 'ember-uploader/components/file-field'], function (exports, _fileField) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _fileField.default;
});
;define('ember-share-db/components/file-upload', ['exports', 'ember-uploader', 'ember-share-db/config/environment'], function (exports, _emberUploader, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberUploader.default.FileField.extend({
    sessionAccount: Ember.inject.service('session-account'),
    cs: Ember.inject.service('console'),
    url: _environment.default.serverHost + "/asset",
    uploadFile: function (file) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        const uploader = _emberUploader.default.Uploader.create({
          url: this.get('url')
        });
        if (!Ember.isEmpty(file)) {
          let user = this.get('sessionAccount').currentUserName;
          let doc = this.get('sessionAccount').currentDoc;
          let data = { username: user, documentId: doc };
          this.get('cs').log(data);
          uploader.on('progress', e => {
            this.get('cs').log('progress', e);
            this.get('onProgress')(e);
          });
          uploader.on('didUpload', e => {
            this.get('cs').log('didUpload', e);
            this.get('onCompletion')(e);
            resolve();
          });
          uploader.on('didError', (jqXHR, textStatus, errorThrown) => {
            this.get('cs').log('didError', jqXHR, textStatus, errorThrown);
            this.get('onError')(errorThrown);
            reject();
          });
          uploader.upload(file, data);
        } else {
          reject();
        }
      });
    },
    filesDidChange: async function (files) {
      this.get('cs').log("files to upload", files);
      for (var i = 0; i < files.length; i++) {
        await this.uploadFile(files[i]);
      }
      this.get('onAllCompletion')();
    }
  });
});
;define('ember-share-db/components/filter-bar', ['exports', 'ember-railio-grid/components/filter-bar'], function (exports, _filterBar) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _filterBar.default;
    }
  });
});
;define('ember-share-db/components/filter-item', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    filter: null,
    willDestroyElement() {
      this._super(...arguments);
    },
    didUpdateAttrs() {
      this._super(...arguments);
    },
    didReceiveAttrs() {
      this._super(...arguments);
    },
    actions: {
      onFilter() {
        this.get('onFilter')(this.get('filter'));
      }
    }
  });
});
;define('ember-share-db/components/guide-tile', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    guide: "",
    description: Ember.computed('guide', function () {
      return this.get('guide').desc;
    }),
    name: Ember.computed('guide', function () {
      return this.get('guide').name;
    }),
    author: Ember.computed('guide', function () {
      return this.get('guide').author;
    }),
    isSelected: false,
    store: Ember.inject.service('store'),
    index: 0,
    colourId: Ember.computed('index', function () {
      return "tile" + this.get('index') % 5;
    }),
    actions: {
      onClick() {
        this.get('onClick')(this.get("guide"));
      },
      onover() {
        this.set('isSelected', true);
      },
      onout() {
        this.set('isSelected', false);
      }
    }
  });
});
;define('ember-share-db/components/kadenze-guide', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    url: _environment.default.localOrigin
  });
});
;define('ember-share-db/components/kick-classifier-guide', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    guideUrl: _environment.default.localOrigin + "/guides/"
  });
});
;define('ember-share-db/components/lazy-number', ['exports', 'ember-railio-grid/components/lazy-number'], function (exports, _lazyNumber) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _lazyNumber.default;
    }
  });
});
;define('ember-share-db/components/learner-guide', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    guideUrl: _environment.default.localOrigin + "/guides/"
  });
});
;define("ember-share-db/components/loading-hud", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    message: "Loading..",
    hideWheel: false
  });
});
;define('ember-share-db/components/lyric-guide', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({});
});
;define('ember-share-db/components/magnet-guide', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({});
});
;define('ember-share-db/components/main-navigation', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({

    session: Ember.inject.service('session'),
    documentService: Ember.inject.service('documents'),
    mediaQueries: Ember.inject.service(),
    sessionAccount: Ember.inject.service('session-account'),
    store: Ember.inject.service('store'),
    cs: Ember.inject.service('console'),
    logoURL: _environment.default.localOrigin + "/images/logo-animation-cropped.gif",
    url: _environment.default.localOrigin,
    ownedDocuments: Ember.computed('sessionAccount.ownedDocuments', function () {
      return this.get('sessionAccount').ownedDocuments;
    }),
    guides: Ember.inject.service(),
    actions: {
      createDoc() {
        const src = this.get('documentService').getDefaultSource();
        const data = { name: "New Project", isPrivate: false, source: src };
        this.get('documentService').makeNewDoc(data).then(() => {
          this.get('onCreateDoc')();
        });
      },
      allDocs() {
        this.get('cs').log(this.get('sessionAccount').currentUserName);
        this.get('openUserDocs')(this.get('sessionAccount').currentUserName);
      },
      login() {
        this.get('onLogin')();
      },
      logout() {
        this.get('session').invalidate();
      },
      docs() {
        this.get('onDocs')();
      },
      about() {
        this.get('onAbout')();
      },
      gettingStarted() {
        this.get('onGettingStarted')();
      },
      people() {
        this.get('onPeople')();
      },
      examples() {
        this.get('onExamples')();
      },
      inputs() {
        this.get('onInputs')();
      },
      outputs() {
        this.get('onOutputs')();
      },
      guides() {
        this.get('onGuides')();
      },
      openDoc(doc) {
        this.get('cs').log(doc);
        this.get('openDoc')(doc);
      },
      openGuide(guide) {
        this.get('cs').log(guide);
        this.get('openGuide')(guide);
      }
    }
  });
});
;define('ember-share-db/components/main-paginator', ['exports', 'ember-railio-grid/components/main-paginator'], function (exports, _mainPaginator) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _mainPaginator.default;
    }
  });
});
;define('ember-share-db/components/mario-guide', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({});
});
;define('ember-share-db/components/markov-guide', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    url: _environment.default.localOrigin + "/images/"
  });
});
;define('ember-share-db/components/maxiinstrument-guide', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({});
});
;define('ember-share-db/components/maximillian-guide', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({});
});
;define('ember-share-db/components/merkgenta-guide', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({});
});
;define('ember-share-db/components/mimic-footer', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    url: _environment.default.localOrigin
  });
});
;define('ember-share-db/components/mmll-guide', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({});
});
;define('ember-share-db/components/modal-preview-body', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({});
});
;define('ember-share-db/components/modals-container', ['exports', 'ember-bootstrap-modals-manager/components/modals-container'], function (exports, _modalsContainer) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _modalsContainer.default;
    }
  });
});
;define('ember-share-db/components/modals-container/alert', ['exports', 'ember-bootstrap-modals-manager/components/modals-container/alert'], function (exports, _alert) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _alert.default;
    }
  });
});
;define('ember-share-db/components/modals-container/base', ['exports', 'ember-bootstrap-modals-manager/components/modals-container/base'], function (exports, _base) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _base.default;
    }
  });
});
;define('ember-share-db/components/modals-container/check-confirm', ['exports', 'ember-bootstrap-modals-manager/components/modals-container/check-confirm'], function (exports, _checkConfirm) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _checkConfirm.default;
    }
  });
});
;define('ember-share-db/components/modals-container/confirm', ['exports', 'ember-bootstrap-modals-manager/components/modals-container/confirm'], function (exports, _confirm) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _confirm.default;
    }
  });
});
;define('ember-share-db/components/modals-container/process', ['exports', 'ember-bootstrap-modals-manager/components/modals-container/process'], function (exports, _process) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _process.default;
    }
  });
});
;define('ember-share-db/components/modals-container/progress', ['exports', 'ember-bootstrap-modals-manager/components/modals-container/progress'], function (exports, _progress) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _progress.default;
    }
  });
});
;define('ember-share-db/components/modals-container/prompt-confirm', ['exports', 'ember-bootstrap-modals-manager/components/modals-container/prompt-confirm'], function (exports, _promptConfirm) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _promptConfirm.default;
    }
  });
});
;define('ember-share-db/components/modals-container/prompt', ['exports', 'ember-bootstrap-modals-manager/components/modals-container/prompt'], function (exports, _prompt) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _prompt.default;
    }
  });
});
;define('ember-share-db/components/ops-player', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    isPlaying: false,
    cs: Ember.inject.service('console'),
    init() {
      this._super(...arguments);
      this.get('cs').log("init op player", this.get('isPlaying'));
    },
    didUpdateAttrs() {
      this._super(...arguments);
      this.get('cs').log("did upate op player", this.get('isPlaying'));
    },
    actions: {
      prev() {
        this.get('onSkip')(true);
      },
      next() {
        this.get('onSkip')(false);
      },
      play() {
        if (!this.get('isPlaying')) {
          this.get('onPlay')();
        }
      },
      pause() {
        if (this.get('isPlaying')) {
          this.get('onPause')();
        }
      },
      rewind() {
        this.get('onRewind')();
      }
    }
  });
});
;define('ember-share-db/components/page-picker-paginator', ['exports', 'ember-railio-grid/components/page-picker-paginator'], function (exports, _pagePickerPaginator) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _pagePickerPaginator.default;
    }
  });
});
;define('ember-share-db/components/page-size-picker', ['exports', 'ember-railio-grid/components/page-size-picker'], function (exports, _pageSizePicker) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _pageSizePicker.default;
    }
  });
});
;define('ember-share-db/components/people-tile', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    isSelected: false,
    store: Ember.inject.service('store'),
    index: 0,
    svgClass: "shape-svg people-shape-svg",
    colourId: Ember.computed('index', function () {
      return "tile" + this.get('index') % 5;
    }),
    actions: {
      onClick() {
        window.open(this.get("person.personalURL"));
      },
      onover() {
        this.set('isSelected', true);
      },
      onout() {
        this.set('isSelected', false);
      }
    }
  });
});
;define('ember-share-db/components/project-tabs', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    documentService: Ember.inject.service('documents'),
    cs: Ember.inject.service('console'),
    didReceiveAttrs() {
      this._super(...arguments);
    },
    actions: {
      createNewDocument() {
        this.get('cs').log("creating new tab", this.get('parent').id);
        const parent = this.get('parent');
        const name = "newTab" + this.get('tabs').length;
        const data = { name: name, isPrivate: true, source: "" };
        this.get('documentService').makeNewDoc(data, null, parent.id).then(doc => {
          this.get('onCreate')(doc.id);
        }).catch(error => {
          this.get('cs').log(error);
        });
      }
    }
  });
});
;define('ember-share-db/components/rapidlib-guide', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({});
});
;define('ember-share-db/components/recording-guide', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    url: _environment.default.localOrigin
  });
});
;define('ember-share-db/components/recording-panel', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    showUserInput: false,
    url: _environment.default.localOrigin,
    didRender() {
      this._super(...arguments);
      if (!this.get('showUserInput')) {
        this.updateSelectedNode();
      }
    },
    isRecording: Ember.computed('options', {
      get() {
        return this.get('options.isRecording');
      },
      set(key, value) {
        return this._isRecording = value;
      }
    }),
    selectedNode: Ember.computed('options', {
      get() {
        return this.get('options.node');
      },
      set(key, value) {
        return this._selectedNode = value;
      }
    }),
    updateOptions: function () {
      this.onOptionsChanged({
        isRecording: this.get("isRecording"),
        node: this.get("selectedNode")
      });
    },
    updateSelectedNode: function () {
      if (this.get('isRecording')) {
        let i = this.get('options.node.index');
        if (i === undefined) {
          i = 0;
        }
        document.getElementById("rec-select").selectedIndex = i;
        this.set('showUserInput', i === this.get('possibleNodes').length + 1);
        if (this.get('showUserInput')) {
          this.set('userNode', this.get('selectedNode.variable'));
        }
      }
    },
    userNodeSelected: function () {
      const node = {
        library: "user",
        index: this.get('possibleNodes').length + 1,
        variable: this.get('userNode')
      };
      this.set('selectedNode', node);
      this.updateOptions();
    },
    actions: {
      toggleRecording() {
        this.toggleProperty('isRecording');
        this.updateOptions();
      },
      onSelectNode(index) {
        if (index === "user") {
          this.userNodeSelected();
        } else {
          const i = parseInt(index);
          const node = this.get('possibleNodes')[i];
          node.index = i + 1;
          this.set('selectedNode', node);
          this.updateOptions();
        }
        this.set('showUserInput', this.get('selectedNode').index === this.get('possibleNodes').length + 1);
      },
      endEdittingUserNode() {
        this.userNodeSelected();
      }
    }
  });
});
;define('ember-share-db/components/rhythm-remixer-guide', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({});
});
;define('ember-share-db/components/shape-cell', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    filter: null,
    cs: Ember.inject.service('console'),
    svgClass: "shape-svg",
    killAnimation() {
      if (!Ember.isEmpty(this.get('animationInterval'))) {
        clearInterval(this.get('animationInterval'));
      }
    },
    updateAnimationState() {
      this.killAnimation();
      if (this.get('isSelected')) {
        this.set('animationInterval', setInterval(() => {
          var sh = this.get('shapes');
          var newSh = Array(sh.length);
          for (var i = 0; i < sh.length; i++) {
            var s = sh[i];
            var newS = { x: s.x, y: s.y, r: s.r, dy: s.dy, dx: s.dx, isCircle: s.isCircle, isRect: s.isRect };
            var x = s.x;
            x = x + s.dx;
            var y = s.y;
            y = y + s.dy;
            if (x >= 100 - s.r && newS.dx > 0) {
              newS.dx = -newS.dx;
            }
            if (x <= 0 && newS.dx < 0) {
              newS.dx = -newS.dx;
            }
            if (y >= 60 && newS.dy > 0) {
              newS.dy = -newS.dy;
            }
            if (y <= 0 && newS.dy < 0) {
              newS.dy = -newS.dy;
            }
            newS.x = x;
            newS.y = y;
            newS.yr = y - s.r;
            newS.xr = x + s.r;
            newS.x2r = x + s.r / 2;
            newSh[i] = newS;
          }
          this.set('shapes', newSh);
        }, 70));
      }
    },
    initShapes() {
      if (Ember.isEmpty(this.get('shapes'))) {
        var sh = [];
        var r;
        var xStart = 0;
        var indent = false;
        var isCircle = false;
        var isRect = false;
        var xShift;
        var yShift;
        var xIndent;
        var yStart = 0;

        //CIRCLE
        if (this.get('colourId') === "tile0" || this.get('colourId') === "tile3") {
          r = 8;
          xStart = 20;
          indent = true;
          xShift = 40;
          yShift = 12;
          xIndent = 20;
          isCircle = true;
        }
        //RECT
        else if (this.get('colourId') === "tile1" || this.get('colourId') === "tile4") {
            r = 15;
            xShift = 2 * r;
            yShift = r;
            xIndent = r;
            isRect = true;
            // yStart = -r * 0.7;
            // xStart = -r * 0.4;
          }
          //TRIANGLE
          else {
              r = 10;
              xShift = 2 * r;
              yShift = r * 0.75;
              xIndent = r;
              // yStart = -r * 0.7;
              // xStart = -r * 0.4;
            }

        const w = 100 + 2 * r;
        const h = 60;
        var y = yStart;
        var x = xStart;

        while (y <= h) {
          while (x <= w) {
            sh.push({
              isCircle: isCircle,
              isRect: isRect,
              r: r,
              x: x,
              y: y,
              dx: Math.random() < 0.5 ? Math.random() : -1 * Math.random(),
              dy: Math.random() < 0.5 ? Math.random() : -1 * Math.random()
            });
            if (isCircle) {
              this.get('cs').log(this.get('colourId'), r, x, w, xShift);
            }
            x += xShift;
          }
          x = indent ? 0 : xIndent;
          indent = !indent;
          y += yShift;
        }
        sh.forEach(i => {
          i.yr = i.y - i.r;
          i.xr = i.x + i.r;
          i.x2r = i.x + i.r / 2;
        });
        this.get('cs').log("shapes", sh);
        this.set('shapes', sh);
        this.updateAnimationState();
      }
    },
    willDestroyElement() {
      this._super(...arguments);
      this.killAnimation();
    },
    didUpdateAttrs() {
      this._super(...arguments);
      this.initShapes();
      this.updateAnimationState();
    },
    didReceiveAttrs() {
      this._super(...arguments);
      this.initShapes();
    },
    actions: {}
  });
});
;define('ember-share-db/components/share-modal', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({});
});
;define('ember-share-db/components/space-drum', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({});
});
;define('ember-share-db/components/spec-guide', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({});
});
;define('ember-share-db/components/sun-on-your-skin-guide', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    guideUrl: _environment.default.localOrigin + "/guides/"
  });
});
;define('ember-share-db/components/supervised-ml-guide', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    url: _environment.default.localOrigin + "/images/",
    guideUrl: _environment.default.localOrigin + "/guides/",
    exampleUrl: _environment.default.localOrigin + "/examples/"
  });
});
;define('ember-share-db/components/tab-item', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    cs: Ember.inject.service('console'),
    didReceiveAttrs() {
      this._super(...arguments);
      const tabid = "tab" + (this.get('tabIndex') + 1) % 5;
      this.set('tabID', tabid);
    },
    actions: {
      onSelect() {
        this.get('cs').log("tab item selected", this.get('id'));
        this.get('onSelect')(this.get('id'));
      },
      onDelete() {
        this.get('onDelete')(this.get('id'));
      }
    }
  });
});
;define('ember-share-db/components/tokenfield-input', ['exports', 'ember-share-db/templates/components/tokenfield-input'], function (exports, _tokenfieldInput) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.KEYCODE = undefined;
    const KEYCODE = exports.KEYCODE = {
        ENTER: 13,
        DELETE: 46,
        S: 83,
        s: 115,
        LEFT_ARROW: 37,
        RIGHT_ARROW: 39,
        BACKSPACE: 8,
        TAB: 9,
        COMMA: 188
    };

    exports.default = Ember.Component.extend({
        // Component properties
        layout: _tokenfieldInput.default,
        classNames: ['uncharted-tokenfield-input'],
        classNameBindings: ['isFocused:uncharted-focus'],
        attributeBindings: ['tabindex'],
        tabindex: 0,

        // Properties
        tokens: null,
        placeholder: null,
        addTokenOnBlur: true,
        allowDuplicates: false,
        editable: false,
        showInput: false,
        tokenComponent: 'base-token',

        tokenfieldId: Ember.computed('elementId', function () {
            return `${this.elementId}-tokenfield`;
        }),
        addButtonId: Ember.computed('elementId', function () {
            return `${this.elementId}-add-btn`;
        }),
        labelId: Ember.computed('elementId', function () {
            return `${this.elementId}-token-label`;
        }),

        // State
        inputValue: null,
        isFocused: null,
        hasTokens: Ember.computed.notEmpty('tokens'),
        selectedTokenIndex: null,
        showDuplicateMessage: false,

        // Lifecycle
        init() {
            this._super(...arguments);
            if (Ember.isNone(this.get('tokens'))) {
                this.set('tokens', Ember.A());
            }
        },

        didUpdateAttrs() {
            this._super(...arguments);
            const addBtn = document.getElementById(this.get("addButtonId"));
            if (!Ember.isEmpty(addBtn)) {
                if (this.get('editable')) {
                    addBtn.style.display = 'block';
                } else {
                    addBtn.style.display = 'none';
                }
            }
        },

        didInsertElement() {
            this._super(...arguments);

            // const textInput = document.getElementsByClassName("uncharted-token-input");
            // console.log(textInput);
            const textInput = $(".uncharted-token-input");
            this._textInputElement = textInput;
            textInput.on('keydown', this._keydownHandler.bind(this)).on('focus', this._focusHandler.bind(this)).on('blur', this._inputWasBlurred.bind(this));

            const me = document.getElementsByClassName("uncharted-form-control")[0];
            console.log(me);
            me.onkeydown = this._tokenNavigationHandler.bind(this);
            me.onfocus = this._focusHandler.bind(this);
            me.onblur = this._componentWasBlurred.bind(this);
        },

        willDestroyElement() {
            this._super(...arguments);

            this._textInputElement.off('keydown', this._keydownHandler.bind(this)).off('focus', this._focusHandler.bind(this)).off('blur', this._inputWasBlurred.bind(this));

            const me = document.getElementsByClassName("uncharted-form-control")[0];
            console.log(me);
            me.onkeydown = this._tokenNavigationHandler.bind(this);
            me.onfocus = this._focusHandler.bind(this);
            me.onblur = this._componentWasBlurred.bind(this);
        },

        toggleInput() {
            this.toggleProperty('showInput');
            this.set('showDuplicateMessage', false);
            this.inputToggled();
        },

        // Actions
        actions: {

            addPressed() {
                this.toggleInput();
            },

            editToken(token) {
                this._editToken(token);
            },

            removeToken(token) {
                this._removeToken(token);
                this._focusTextInput();
            },

            createToken(token) {
                this._addToken(token);
                this._focusTextInput();
            },

            selectToken(token, index) {
                if (this.get('editable')) {
                    return;
                }
                console.log("HERE", token, index);
                this.searchTag(token);
                this.set('selectedTokenIndex', index);
            }
        },

        _onDisabledChanged: Ember.observer('disabled', function () {
            if (!this.get('editable')) {
                this._blurComponent();
            }
        }),

        _onInputValueChanged: Ember.observer('inputValue', function () {
            if (!this.get('editable')) {
                return;
            }
            const value = this.get('inputValue');
            if (value.indexOf(',') > -1) {
                const values = value.split(',');
                values.forEach(this._addToken.bind(this));
                this.set('inputValue', '');
            }
        }),

        // Event handlers
        _keydownHandler(e) {
            if (!this.get('editable')) {
                return;
            }
            const wasEnterKey = e.which === KEYCODE.ENTER;
            const wasTabKey = e.which === KEYCODE.TAB;
            const hasValue = !Ember.isEmpty(this.get('inputValue'));
            const shouldCreateToken = wasEnterKey || wasTabKey && hasValue;

            if (this.get('showDuplicateMessage')) {
                this.set('showDuplicateMessage', false);
            }

            if (shouldCreateToken) {
                this._addToken(this.get('inputValue'));
                e.preventDefault();
                e.stopPropagation();
            }
        },

        _tokenNavigationHandler(e) {
            if (!this.get('editable')) {
                return;
            }
            // Highlight text hit backspace wtf?!?!
            const cursorIndex = e.target.selectionStart;
            const cursorIsAtStart = cursorIndex === 0;
            const hasSelectedToken = !Ember.isNone(this.get('selectedTokenIndex'));
            switch (e.which) {
                case KEYCODE.BACKSPACE:
                    if (hasSelectedToken) {
                        const prevTokenIndex = this.get('selectedTokenIndex') - 1;
                        this._removeToken(this.get('tokens').objectAt(this.get('selectedTokenIndex')));
                        if (prevTokenIndex > -1) {
                            this._setSelectedTokenIndex(prevTokenIndex);
                            e.preventDefault();
                        } else {
                            this._focusTextInput();
                        }
                    } else if (Ember.isEmpty(this.get('inputValue')) && cursorIsAtStart) {
                        this._setSelectedTokenIndex(this.get('tokens.length') - 1);
                        e.preventDefault();
                    }
                    break;
                case KEYCODE.ENTER:

                    if (hasSelectedToken) {
                        const tokenValue = this.get('tokens').objectAt(this.get('selectedTokenIndex'));
                        this._editToken(tokenValue);
                    } else if (!Ember.isEmpty(this.get('inputValue'))) {
                        this._addToken(this.get('inputValue'));
                    }
                    break;
                case KEYCODE.LEFT_ARROW:
                    if (hasSelectedToken) {
                        const prevTokenIndex = this.get('selectedTokenIndex') - 1;
                        if (prevTokenIndex > -1) {
                            this._setSelectedTokenIndex(prevTokenIndex);
                        }
                    } else if (Ember.isEmpty(this.get('inputValue'))) {
                        this._setSelectedTokenIndex(this.get('tokens.length') - 1);
                    }
                    break;
                case KEYCODE.RIGHT_ARROW:
                    {
                        const selectedTokenIndex = this.get('selectedTokenIndex');
                        if (Ember.isNone(selectedTokenIndex)) {
                            break;
                        }

                        if (selectedTokenIndex >= this.get('tokens.length') - 1) {
                            // We were at the last token so lets focus the text input
                            this._setSelectedTokenIndex(null);
                            this._focusTextInput();
                        } else {
                            this._setSelectedTokenIndex(selectedTokenIndex + 1);
                        }
                        break;
                    }
                case KEYCODE.TAB:
                    if (hasSelectedToken) {
                        this._blurComponent();
                    } else if (!Ember.isEmpty(this.get('inputValue'))) {
                        this._addToken(this.get('inputValue'));
                    }
                    break;
            }
        },

        _focusHandler(e) {
            if (!this.get('editable')) {
                return;
            }
            this.set('isFocused', true);
            if (e.target === this.element) {
                // Div focus event
                if (Ember.isNone(this.get('selectedTokenIndex'))) {
                    this._focusTextInput();
                }
            } else {
                // Input focus event
                this.set('selectedTokenIndex', null);
            }
        },

        _componentWasBlurred() {
            if (!this.get('editable')) {
                return;
            }
            this.set('isFocused', false);
            this.set('selectedTokenIndex', null);
        },

        _inputWasBlurred() {
            if (Ember.isNone(this.get('selectedTokenIndex'))) {
                this._blurComponent();
            }
        },

        // Internal methods
        _focusComponent() {
            const me = document.getElementsByClassName("uncharted-form-control");
            console.log(me);
            me.focus();
        },

        _focusTextInput() {
            if (!this.get('editable')) {
                return;
            }
            this._textInputElement.focus();
        },

        _blurComponent() {
            if (!this.get('editable')) {
                return;
            }
            if (this.get('addTokenOnBlur') && !Ember.isEmpty(this.get('inputValue'))) {
                this._addToken(this.get('inputValue'));
            }
            this.set('isFocused', false);
            this.set('selectedTokenIndex', null);
        },

        _setSelectedTokenIndex(index) {
            if (!this.get('editable')) {
                return;
            }
            this.set('selectedTokenIndex', index);
            this._textInputElement.blur();
            if (!Ember.isNone(index)) {
                this._focusComponent();
            }
        },

        _removeToken(value) {
            if (!this.get('editable')) {
                return;
            }
            this.get('tokens').removeObject(value);
            this.set('selectedTokenIndex', null);
            this.get('tokensChanged')(this.get('tokens'));
        },

        _addToken(value) {
            if (!this.get('editable')) {
                return;
            }
            if (!Ember.isNone(value)) {
                value = value.trim();
                const isDuplicate = this.get('tokens').map(token => token.toLowerCase()).includes(value.toLowerCase());
                const allowDuplicates = this.get('allowDuplicates');
                const hasValue = !Ember.isEmpty(value);
                const willAdd = hasValue && (allowDuplicates || !isDuplicate);

                if (willAdd) {
                    this.get('tokens').pushObject(value);
                    this.set('inputValue', '');
                    this.get('tokensChanged')(this.get('tokens'));
                    this.set('showDuplicateMessage', false);
                } else if (!allowDuplicates && isDuplicate) {
                    this.set('showDuplicateMessage', true);
                }
            }
        },

        _editToken(value) {
            if (!this.get('editable')) {
                return;
            }
            this._removeToken(value);
            if (!Ember.isNone(this.get('inputValue'))) {
                this._addToken(this.get('inputValue'));
            }
            this.set('inputValue', value);
            Ember.run.schedule('afterRender', this, function () {
                this._textInputElement.focus();
                this._textInputElement.select();
            });
            this.set('showInput', true);
            this.set('showDuplicateMessage', false);
        }
    });
});
;define('ember-share-db/components/welcome-page', ['exports', 'ember-welcome-page/components/welcome-page'], function (exports, _welcomePage) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _welcomePage.default;
    }
  });
});
;define('ember-share-db/controllers/about', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Controller.extend({
    url: _environment.default.localOrigin + "/images",
    docURL: _environment.default.localOrigin + "/d/ /0/views",
    termsURL: _environment.default.localOrigin + "/terms",
    peopleURL: _environment.default.localOrigin + "/people",
    mediaQueries: Ember.inject.service(),
    actions: {
      refresh() {}
    }
  });
});
;define('ember-share-db/controllers/application', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Controller.extend({
    store: Ember.inject.service(),
    sessionAccount: Ember.inject.service('session-account'),
    actions: {
      transitionToLoginRoute() {
        this.transitionToRoute('login');
      },
      transitionToDocsRoute() {
        this.transitionToRoute('documents', " ", 0, "views");
      },
      transitionToExamplesRoute() {
        this.transitionToRoute('examples', 'root');
      },
      transitionToInputsRoute() {
        this.transitionToRoute('inputs');
      },
      transitionToOutputsRoute() {
        this.transitionToRoute('outputs');
      },
      transitionToGuidesRoute() {
        this.transitionToRoute('guides', "root");
      },
      transitionToGSRoute() {
        this.transitionToRoute('getting-started', 'beginner');
      },
      transitionToAboutRoute() {
        this.transitionToRoute('about');
      },
      transitionToPeopleRoute() {
        this.transitionToRoute('people');
      },
      transitionToTermsRoute() {
        this.transitionToRoute('terms');
      },
      transitionToDoc(doc) {
        this.transitionToRoute('code-editor', doc);
      },
      transitionToUserDocs(user) {
        console.log("GETTING DOCS FOR USER:", user);
        this.transitionToRoute('documents', user, 0, "date");
      },
      transitionToGuide(guide) {
        this.transitionToRoute('guides', guide);
      },
      transitionToNewestDoc() {
        const currentUserId = this.get('sessionAccount').currentUserId;
        this.get('store').query('document', {
          filter: { search: "",
            page: 0,
            currentUser: currentUserId,
            sortBy: 'date' }
        }).then(documents => {
          this.get('sessionAccount').updateOwnedDocuments();
          this.transitionToRoute('code-editor', documents.firstObject.documentId);
        });
      }
    }
  });
});
;define('ember-share-db/controllers/code-editor', ['exports', 'sharedb/lib/client', 'reconnecting-websocket', 'ember-share-db/config/environment'], function (exports, _client, _reconnectingWebsocket, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Controller.extend({
    //Query Params
    queryParams: ["showCode", "embed", "viewer"],

    //Services
    websockets: Ember.inject.service('websockets'),
    mediaQueries: Ember.inject.service(),
    resizeService: Ember.inject.service('resize'),
    sessionAccount: Ember.inject.service('session-account'),
    assetService: Ember.inject.service('assets'),
    store: Ember.inject.service('store'),
    session: Ember.inject.service('session'),
    codeParser: Ember.inject.service('code-parsing'),
    modalsManager: Ember.inject.service('modalsManager'),
    documentService: Ember.inject.service('documents'),
    autocomplete: Ember.inject.service('autocomplete'),
    opsPlayer: Ember.inject.service('ops-player'),
    cs: Ember.inject.service('console'),
    library: Ember.inject.service(),

    //Parameters
    con: null,
    parentData: null,
    currentDoc: null,
    editor: null,
    suppress: false,
    codeTimer: null,
    isNotEdittingDocName: true,
    canEditSource: false,
    canEditSettings: false,
    isOwner: false,
    autoRender: false,
    codeTimerRefresh: 500,
    collapsed: true,
    showShare: false,
    showReadOnly: false,
    showRecordingPanel: false,
    showColabOptions: false,
    showAssets: false,
    showPreview: false,
    showSettings: false,
    showCodeControls: true,
    showConnectionWarning: false,
    isShowingCode: true,
    isDragging: false,
    startWidth: 0,
    startX: 0,
    codeW: "",
    savedVals: null,
    hideEditor: 'false',
    embed: 'false',
    titleName: "",
    wsAvailable: true,
    editCtr: 0,
    fontSize: 14,
    fetchingDoc: false,
    consoleOutput: "",
    feedbackTimer: null,
    doPlay: true,
    isPlayingOps: false,
    isRoot: true,
    isMobile: false,
    iframeTitle: "title",
    prevEvalReceived: 0,
    gotFirstEval: false,
    updateSourceRate: 30000,
    updateSourceOnInterval: false,
    updateSourceInterval: undefined,
    evalPtr: 0,
    highContrast: false,

    showHUD: true,
    hudMessage: "Loading...",

    renderedSource: "",

    //Computed parameters

    aceStyle: Ember.computed('codeW', function () {
      this.updateDragPos();
      const codeW = this.get('codeW');
      const display = this.get('showCodeControls') ? "inline" : "none";
      //this.get('cs').log("updating ace style", codeW, display)
      return Ember.String.htmlSafe("width: " + codeW + "; display: " + display + ";");
    }),
    titleNoName: "",
    editLink: Ember.computed('model', function () {
      return _environment.default.localOrigin + "/code/" + this.get('model').id;
    }),
    embedLink: Ember.computed('editLink', function () {
      return this.get('editLink') + "?embed=true";
    }),
    libraries: Ember.computed('library.libraryMap', function () {
      return this.get("library").libraryMap;
    }),

    //Functions
    init: function () {
      this._super();
      this.set('tabs', []);
      this.set('droppedOps', []);
      this.set('cursors', {});
      this.set('children', []);
      this.set('recordingOptions', { isRecording: false });
      this.set('scrollPositions', {});
      // console.log("hijacking console")
      // this.hijackConsoleOutput();
      this.set('colabMode', _environment.default.colabMode);
      this.get('cs').log("colabMode", this.get('colabMode'));
      this.get('resizeService').on('didResize', event => {
        if (!this.get('leftCodeEditor')) {
          //Bound the code window
          const codeW = parseInt(this.get('codeW').substring(0, this.get('codeW').length - 2));
          const containerW = document.getElementById("main-code-container").offsetWidth;
          if (codeW > containerW) {
            this.set('codeW', containerW + "px");
          }
          this.set('isMobile', !this.get('mediaQueries').isDesktop && (!this.get('isEmbeddedWithCode') || !this.get('isEmbedded')));
          this.get('cs').log("isMobile", this.get('isMobile'));
          document.getElementById("ace-container").style.visibility = this.get('isMobile') ? "hidden" : "visible";
          if (this.get("mediaQueries.isDesktop")) {
            this.updateDragPos();
          }
          this.syncOutputContainer();
        }
      });
    },
    begin: function () {
      this.get('cs').log("beginning");
      this.set("hudMessage", "");
      this.set("showHUD", true);
      this.clearTabs();
      this.set("wsAvailable", false);
      this.set("isViewer", this.get('viewer') == "true");
      this.get("cs").log("selectRootDoc", "begin");
      this.initFromUrl();
      this.selectRootDoc().then(() => {
        if (this.get("canEditSource")) {
          this.initShareDB();
        }
        this.initUI();
        this.addWindowListener();
      });
    },
    initViewer: function () {
      //Can't be a viewer and an editor
      if (this.get("canEditSource")) {
        this.set("isViewer", false);
      }
      if (this.get("isViewer")) {
        this.get("cs").log("initViewer");
        this.resetOpsPlayer();
      }
    },
    resetOpsPlayer: function () {
      if (this.get("isViewer")) {
        this.cleanUpOpPlayer();
        this.get("cs").log("starting op time (code editor)");
        this.get("opsPlayer").startTimer(this.get("editor")).then(() => {
          let didClear = false;
          this.get("cs").log("started op time (code editor)");
          this.set("viewerInterval", setInterval(() => {
            const playerOps = this.get("opsPlayer").getToSend();
            if (playerOps.length > 0) {
              playerOps.forEach(ops => {
                this.didReceiveOp(ops.op, null, ops.v);
              });
            }
            if (!didClear) {
              this.clearCursors();
              didClear = true;
            }
          }, 100));
        });
      }
    },
    initShareDB: function () {
      this.get('cs').log('initShareDB');
      this.set('leftCodeEditor', false);
      this.initWebSockets();
    },
    initFromUrl: function () {
      this.set('isEmbedded', this.get('embed') == "true");
      this.set('isEmbeddedWithCode', this.get('showCode') == "true");
    },
    initUI: function () {
      //this.set('collapsed', true);
      setTimeout(() => {
        const embed = this.get("isEmbedded");
        const embedWithCode = this.get("isEmbeddedWithCode");
        this.set('isMobile', !this.get('mediaQueries').isDesktop && (!this.get('isEmbeddedWithCode') || !this.get('isEmbedded')));
        this.get('cs').log("isMobile", this.get('isMobile'));
        this.set('showCodeControls', !(embed && !embedWithCode) || this.get('isDesktop'));
        this.set("codeW", embedWithCode ? "0px" : window.innerWidth / 2 + "px");
        if (embed) {
          document.getElementById("main-code-container").style.height = "95vh";
          document.getElementById("main-code-container").style.width = "100vw";
          document.getElementById("output-container").style["border-top-width"] = 0;
          document.getElementById("output-container").style["border-bottom-width"] = 0;
          document.getElementById("output-container").style["border"] = "none";
          document.getElementById("output-container").style["width"] = "100%";
          document.getElementById("output-container").style["height"] = "100%";
          document.getElementById("output-container").style["top"] = "0px";
          document.getElementById("output-container").style["left"] = "0px";
          document.getElementById("main-site-container").style.padding = "0px";
          document.getElementById("main-site-container").style.border = "none";
        } else {
          document.getElementsByClassName("CodeMirror")[0].style.height = "80vh";
        }

        if (embedWithCode) {
          this.hideCode(true);
        }
        const nav = document.getElementById("mimic-navbar");
        nav.style.display = embed ? "none" : "block";
        const logo = document.getElementById("main-logo");
        logo.style.display = "none";
        const log = document.getElementById("login-container");
        log.style.top = "20px";
        const footer = document.getElementById("mimic-footer");
        footer.style.display = embed ? "none" : "block";
        const container = document.getElementById("main-site-container");
        container.style["padding-left"] = embed ? "0%" : "8%";
        container.style["padding-right"] = embed ? "0%" : "8%";
        this.updateDragPos();
        this.get('cs').observers.push(this);
      }, 50);
    },
    initWebSockets: function (onSelectDoc) {
      let socket = this.get('socket');
      this.get('cs').log("init websockets", socket);
      if (!Ember.isEmpty(socket) && socket.state == 1) {
        this.get('cs').log("websocket is empty");
        socket.onclose = () => {
          this.get('cs').log("websocket closed, reopening");
          this.set('socket', null);
          this.initWebSockets();
        };
        socket.close();
      } else {
        try {
          let url = this.get("model.isCollaborative") ? _environment.default.colabWsHost : _environment.default.wsHost;
          if (Ember.isEmpty(url)) {
            url = _environment.default.wsHost;
          }
          this.get("cs").log("connecting to", url);
          socket = new _reconnectingWebsocket.default(url);
          this.set('socket', socket);
          socket.onopen = () => {
            console.log("web socket open");
            if (this.get('leftCodeEditor')) {
              this.get('cs').log("opened connection but had already left code editor");
            } else {
              this.set('wsAvailable', true);
              if (!this.get('fetchingDoc')) {
                this.get("cs").log("selectRootDoc", "websockets");
                this.selectRootDoc().then(() => {
                  if (onSelectDoc) {
                    onSelectDoc();
                  }
                });
              }
            }
          };
          socket.onerror = () => {
            this.get('cs').log("web socket error");
            this.websocketError();
          };
          socket.onclose = () => {
            this.get('cs').log("websocket closed, calling error");
            this.websocketError();
          };
          socket.onmessage = event => {
            this.get('cs').log("web socket message", event);
            const d = JSON.parse(event.data);
            if (d.a == "init" && d.type == "http://sharejs.org/types/JSONv0") {
              this.set('fetchingDoc', false);
              this.websocketError();
            }
          };
        } catch (err) {
          this.get('cs').log("web sockets not available");
          this.websocketError();
        }
      }
    },
    cleanUpOpPlayer: function () {
      //this.set("isViewer",false);
      this.set("prevEvalReceived", 0);
      this.set("gotFirstEval", false);
      this.get("opsPlayer").cleanUp();
      if (!Ember.isEmpty(this.get("viewerInterval"))) {
        clearInterval(this.get("viewerInterval"));
        this.set("viewerInterval", null);
      }
    },
    cleanUpShareDB: function () {
      if (this.get('wsAvailable') && !Ember.isEmpty(this.get('sharedDBDoc'))) {
        this.get('cs').log("clearning up sharedb");
        try {
          this.get('sharedDBDoc').destroy();
        } catch (err) {
          this.get('cs').log("error destroying sharedb connection", err);
        }
        this.set('sharedDBDoc', null);
      }
    },
    cleanUpConnections: function () {
      return new Ember.RSVP.Promise((resolve, reject) => {
        this.cleanUpShareDB();
        this.set('currentDoc', null);

        if (!Ember.isEmpty(this.get('socket'))) {
          this.get('socket').removeEventListener('error');
          this.get('socket').removeEventListener('open');
          this.get('socket').removeEventListener('close');
          this.get('socket').removeEventListener('message');
          this.get('socket').onclose = null;
          this.get('socket').onopen = null;
          this.get('socket').onmessage = null;
          this.get('socket').onerror = null;
          this.get('socket').close();
          this.set('socket', null);
        }
        if (!Ember.isEmpty(this.get('connection'))) {
          this.get('connection').close();
          this.set('connection', null);
        }
        resolve();
      });
    },
    websocketError: function () {
      this.get('cs').log("websocket error");
      this.set('wsAvailable', false);
      this.cleanUpConnections().then(() => {
        if (!this.get('fetchingDoc') && !this.get('leftCodeEditor')) {
          // this.get('cs').log("selecting doc")
          // this.selectRootDoc();
        }
      });
    },
    newDocSelected: function (docId) {
      this.get('cs').log("newDocSelected");
      return new Ember.RSVP.Promise((resolve, reject) => {
        let doc = this.get('currentDoc');
        this.get('cs').log("newDocSelected", docId);
        this.set('isRoot', docId == this.get('model').id);
        if (!Ember.isEmpty(doc)) {
          this.cleanUpShareDB();
          this.set('sharedDBDoc', null);
          this.set('currentDoc', null);
        }
        if (!this.get("fetchingDoc")) {
          this.connectToDoc(docId).then(newDoc => {
            this.set('currentDoc', newDoc);
            this.didReceiveDoc().then(() => {
              resolve();
            }).catch(err => reject(err));
          }).catch(err => reject(err));
        }
      });
    },
    selectRootDoc: function () {
      this.get('cs').log("selectRootDoc");
      return new Ember.RSVP.Promise((resolve, reject) => {
        this.newDocSelected(this.get('model').id).then(() => {
          this.updateTabbarLocation();
          this.get('cs').log("loaded root doc, preloading assets");
          this.fetchChildren().then(() => {
            this.resetScrollPositions();
            this.preloadAssets().then(() => {
              if (this.doPlayOnLoad()) {
                this.updateIFrame();
              }
              this.set('doPlay', !this.doPlayOnLoad());
              this.updatePlayButton();
              if (_environment.default.colabMode === false) {
                this.set('model.isCollaborative', false);
              }
              const doc = this.get('currentDoc');
              if (Ember.isEmpty(this.get("model.collaborators"))) {
                this.set("model.collaborators", []);
                this.get('documentService').updateDoc(doc.id, "collaborators", []);
              }
              this.startSyncTimer();
              this.initViewer();
              resolve();
            });
          });
        });
      });
    },
    //This function does really work well for viewer or collaborate modes
    //because its at odds with the ops (disabled at the moment)
    startSyncTimer: function () {
      if (this.get('updateSourceOnInterval') && this.get("isViewer")) {
        this.get('cs').log("setting update source interval");
        if (!Ember.isEmpty(this.get("updateSourceInterval"))) {
          clearInterval(this.get("updateSourceInterval"));
          this.set("updateSourceInterval", null);
        }
        this.set('updateSourceInterval', setInterval(() => {
          this.updateSessionFromServer();
        }, this.get('updateSourceRate')));
      }
    },
    connectToDoc: function (docId) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        this.get('cs').log("connectToDoc doc");
        this.set('fetchingDoc', true);
        if (this.get('wsAvailable')) {
          const socket = this.get('socket');
          let con = this.get('connection');
          if (Ember.isEmpty(con) && !Ember.isEmpty(socket)) {
            this.get('cs').log('connecting to ShareDB');
            con = new _client.default.Connection(socket);
          }
          if (Ember.isEmpty(con) || con.state == "disconnected" || Ember.isEmpty(socket)) {
            this.get('cs').log("failed to connect to ShareDB", con);
            this.set('wsAvailable', false);
            this.fetchDoc(docId).then(doc => resolve(doc));
            return;
          }
          this.set('connection', con);
          const sharedDBDoc = con.get(_environment.default.contentCollectionName, docId);
          sharedDBDoc.subscribe(err => {
            if (err) throw err;
            this.get('cs').log("subscribed to doc");
            if (!Ember.isEmpty(sharedDBDoc.data)) {
              this.set('sharedDBDoc', sharedDBDoc);
              this.fetchDoc(docId).then(doc => resolve(doc));
            }
          });
          sharedDBDoc.on('op', (ops, source) => {
            this.didReceiveOp(ops, source);
          });
        } else {
          this.fetchDoc(docId).then(doc => resolve(doc));
        }
      });
    },
    fetchDoc: function (docId) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        this.get('store').findRecord('document', docId).then(doc => {
          this.get('cs').log("found record");
          resolve(doc);
        });
      });
    },
    //A check to see if we have drifted or lost ops, resyncs if necessary
    updateSessionFromServer: function () {
      return new Ember.RSVP.Promise((resolve, reject) => {
        const doc = this.get('currentDoc');
        this.get('documentService').getSource(doc.id).then(serverSource => {
          const localSource = this.get('editor').getValue();
          if (serverSource !== localSource) {
            this.set("surpress", true);
            const scrollPos = this.get('editor').getCursor(true);
            this.get("editor").focus();
            var scrollInfo = this.get("editor").getScrollInfo();
            this.get("editor").setValue(serverSource);
            this.get("editor").scrollTo(scrollInfo.left, scrollInfo.top);
            this.get("editor").setCursor({ line: scrollPos.line, ch: scrollPos.ch });
            this.set("surpress", false);
            this.get('cs').log("local code out of sync with server");
            resolve();
          } else {
            this.get('cs').log("local code is in sync");
            resolve();
          }
        });
      });
    },
    updateSourceFromSession: function () {
      return new Ember.RSVP.Promise((resolve, reject) => {
        const doc = this.get('currentDoc');
        if (!Ember.isEmpty(doc) && this.get('droppedOps').length == 0) {
          const source = this.get('editor').getValue();
          //THIS DOESNT UPDATE THE ON THE SERVER, ONLY UPDATES THE EMBERDATA MODEL
          //BECAUSE THE "PATCH" REST CALL IGNORES THE SOURCE FIELD
          const actions = [this.get('documentService').updateDoc(doc.id, "source", source)];
          Promise.all(actions).then(() => resolve()).catch(err => {
            this.get('cs').log("error updateSourceFromSession - updateDoc", err);
            reject(err);
          });
        } else {
          resolve();
        }
      });
    },
    reloadDoc: function () {
      const scrollPos = this.get('editor').getCursor(true);
      const editor = this.get("editor");
      this.get('cs').log("reloading doc");
      editor.options.readOnly = true;
      editor.focus();
      var scrollInfo = this.get("editor").getScrollInfo();
      this.updateSessionFromServer().then(() => {
        this.updateSourceFromSession().then(() => {
          this.cleanUpConnections().then(() => {
            this.initWebSockets(() => {
              editor.focus();
              this.get("cs").log("scrolling cur", scrollPos.line, scrollPos.ch);
              editor.scrollTo(scrollInfo.left, scrollInfo.top);
              editor.setCursor({ line: scrollPos.line, ch: scrollPos.ch });
              editor.options.readOnly = !this.get('canEditSource');
            });
          });
        });
      });
    },
    setLanguage: function () {
      const editor = this.get('editor');
      const doc = this.get('currentDoc');
      let lang = "htmlmixed";
      if (!Ember.isEmpty(doc.get('parent'))) {
        const analysedLang = this.get('codeParser').getLanguage(doc.get('source'));
        if (!Ember.isEmpty(analysedLang)) {
          lang = analysedLang;
        }
        this.get('documentService').updateDoc(doc.id, "type", lang);
      }
      editor.setOption("mode", lang);
    },
    didReceiveDoc: function () {
      this.get('cs').log("didReceiveDoc", this.get('isMobile'));
      document.getElementById("ace-container").style.visibility = this.get('isMobile') ? "hidden" : "visible";
      return new Ember.RSVP.Promise((resolve, reject) => {
        this.set("iframeTitle", this.get('model').id);
        const doc = this.get('currentDoc');
        this.get('opsPlayer').reset(doc.id);
        const editor = this.get('editor');
        this.get('cs').log("didReceiveDoc", doc.get('type'));
        this.setLanguage();
        this.set('surpress', true);
        editor.setValue(doc.get('source'));
        editor.clearHistory();
        editor.refresh();
        this.set('surpress', false);
        this.set('savedVals', doc.get('savedVals'));
        this.setCanEditDoc();
        let stats = doc.get('stats');
        stats.views = parseInt(stats.views) + 1;
        this.get('documentService').updateDoc(this.get('model').id, 'stats', stats).catch(err => {
          this.get('cs').log('error updating doc', err);
          reject(err);
          return;
        });
        editor.options.readOnly = !this.get('canEditSource');
        this.get('cs').log("CAN EDIT SOURCE?", this.get('canEditSource'), editor.options.readOnly);
        this.set('showHUD', false);
        this.scrollToSavedPosition();
        this.set('titleName', doc.get('name') + " by " + this.get('model.owner'));
        this.set('titleNoName', doc.get('name'));
        this.get('sessionAccount').set('currentDoc', this.get('model').id);
        this.set('fetchingDoc', false);
        this.get('cs').log("isEmbeddedWithCode", this.get("isEmbeddedWithCode"));
        if (this.get("isEmbeddedWithCode")) {
          this.foldHead();
        }
        resolve();
      });
    },
    setParentData: function (data) {
      const currentDoc = this.get('currentDoc');
      let isSelected = true;
      if (!Ember.isEmpty(currentDoc)) {
        isSelected = data.documentId == currentDoc.id;
      }
      this.set('parentData', { name: data.name,
        id: data.id,
        children: data.children,
        source: data.source,
        assets: data.assets,
        isSelected: isSelected
      });
    },
    clearTabs: function () {
      this.setParentData({
        name: "",
        id: "",
        children: [],
        source: "",
        assets: ""
      });
      this.set('tabs', []);
    },
    setTabs: function (data) {
      const currentDoc = this.get('currentDoc');
      const tabs = data.map(child => {
        const canDelete = this.get('canEditSettings') && child.id == currentDoc.id;
        return { name: child.name, id: child.id, isSelected: child.id == currentDoc.id, canDelete: canDelete };
      });
      this.get('cs').log("tabs", tabs);
      this.set('tabs', tabs);
      this.syncOutputContainer();
    },
    fetchChildren: function () {
      this.get('cs').log("fetchChildren");
      return new Ember.RSVP.Promise((resolve, reject) => {
        let model = this.get('model');
        if (model.children.length == 0) {
          this.set('tabs', []);
          this.set('children', []);
          this.setParentData({
            name: model.name,
            id: model.id,
            children: model.children,
            source: model.source,
            assets: model.assets
          });
          resolve();
        } else {
          this.get('documentService').getChildren(model.children).then(data => {
            this.get('cs').log("got children", data.children);
            this.set('children', data.children);
            this.setTabs(data.children);
            this.setParentData({
              name: this.get('model.name'),
              id: this.get('model.id'),
              children: this.get('model.children'),
              source: this.get('model.source'),
              assets: this.get('model.assets')
            });
            resolve();
          }).catch(err => {
            this.get('cs').log(err);
            reject(err);
          });
        }
      });
    },
    clearCursors() {
      this.get("cs").log("clearing cursors");
      const cursors = this.get('cursors');
      Object.keys(cursors).forEach(c => {
        this.get("cs").log("removing", cursors[c]);
        cursors[c].marker.clear();
      });
    },
    newCursor(op) {
      //this.get("cs").log(op)
      if (Ember.isEmpty(op.owner)) {
        return;
      }
      const toUpdate = this.get('cursors');
      const prev = toUpdate[op.owner];
      const colours = ["#ED3D05", "#FFCE00", "#0ED779", "#F79994", "#4D42EB"];
      if (!Ember.isEmpty(prev)) {
        prev.marker.clear();
      } else {
        toUpdate[op.owner] = { colour: colours[Math.floor(Math.random() * 5)] };
        this.get('cs').log(toUpdate[op.owner].colour);
      }

      const cursorPos = op.cursor;
      const cm = this.get('editor');
      const cursorCoords = cm.cursorCoords(cursorPos);
      const h = cursorCoords.bottom - cursorCoords.top;

      const container = document.createElement('span');
      container.style.height = `${h}px`;
      container.classList.add("cursor-container");

      const label = document.createElement('span');
      label.classList.add("cursor-label");
      label.style.backgroundColor = toUpdate[op.owner].colour;

      label.style.top = `${h}px`;
      label.innerHTML = op.owner;

      const line = document.createElement('span');
      line.classList.add("cursor-line");
      line.style.borderLeftColor = toUpdate[op.owner].colour;

      container.appendChild(line);
      container.appendChild(label);

      toUpdate[op.owner].marker = cm.setBookmark(cursorPos, { widget: container });
      this.set('cursors', toUpdate);
    },
    didReceiveOp: function (ops, source, version = 0) {
      const editor = this.get('editor');
      const canReceiveOp = () => {
        return (this.get('model.isCollaborative') || this.get('isViewer')) && !this.get('isEmbedded');
      };
      this.get("cs").log("didReceiveOp", ops, source, version);
      if (ops.length > 0 && canReceiveOp()) {
        let isFromOwner = false;
        //json inserts have uuids (we might be able to remove these?)
        //source is true if it came from the local machine, seems reliable
        if (ops[0].oi !== undefined) {
          isFromOwner = ops[0].oi.uuid === this.get("sessionAccount").getSessionID();
        }
        //text ops have owners
        if (ops[0].owner !== undefined) {
          isFromOwner = ops[0].owner === this.get('sessionAccount').currentUserName;
        }
        const isCodeUpdate = ops[0].p[0] === "source";
        const isAssetUpdate = ops[0].p[0] == "assetsUpdated" && !Ember.isEmpty(ops[0].oi);
        const isReevaluation = ops[0].p[0] === "newEval" && !Ember.isEmpty(ops[0].oi);
        if (!source && !isFromOwner && isCodeUpdate) {
          this.set('surpress', true);
          this.get('opsPlayer').set('opsToApply', ops);
          let prevHistory = editor.doc.getHistory();
          this.get('opsPlayer').applyTransform(editor);
          let afterHistory = editor.doc.getHistory();
          //WE REMOVE ANY NEW ITEMS FROM THE UNDO HISTORY AS THEY DID NOT
          //COME FROM THE LOCAL EDITOR
          afterHistory.done = afterHistory.done.slice(0, prevHistory.done.length);
          editor.doc.setHistory(afterHistory);
          this.set('surpress', false);
          this.newCursor(ops[0]);
        } else if (!source && !isFromOwner && isAssetUpdate) {
          this.get("cs").log(ops[0].oi);
          this.get('store').findRecord('document', this.get('model').id).then(toChange => {
            toChange.set('assets', ops[0].oi.assets);
            this.get('cs').log("didReceiveOp", "preloadAssets");
            this.preloadAssets();
          });
        }
        //If inserting (oi) a newEval
        else if (!source && !isFromOwner && isReevaluation) {
            console.log("newEval", version, ops, this.get("prevEvalReceived"));
            /*
            We need to filter out unwanted extra newEval ops
            When viewing, we get one extra and make sure the version is higher
            than the last.
            */
            let doFlash = false;
            const date = ops[0].oi.date;
            const doExecute = date > this.get("prevEvalReceived") || !this.get("gotFirstEval");
            if (doExecute) {
              this.set('surpress', true);
              this.set("gotFirstEval", true);
              this.set('prevEvalReceived', date);
              doFlash = true;
              const code = ops[0].oi.code;
              this.updateSavedVals();
              const savedVals = this.get('savedVals');
              let model = this.get('model');
              //We replace the assets etc... on this side (we are sent the raw code)
              this.get('documentService').getCombinedSource(model.id, true, code, savedVals).then(combined => {
                console.log("executing", combined);
                try {
                  document.getElementById("output-iframe").contentWindow.eval(combined);
                } catch (err) {
                  doFlash = false;
                  console.log("error evaluating received code", err);
                }
                if (doFlash && !Ember.isEmpty(ops[0].oi.pos)) {
                  this.flashSelectedText(ops[0].oi.pos);
                }
              });
              this.set('surpress', false);
            } else {
              console.log("recieved but skipped");
            }
          } else if (!source && ops[0].p[0] == "children") {
            // this.get('cs').log(ops[0].oi)
            // this.get('documentService').updateDoc(this.get('model').id, "children", ops[0].oi)
            // .then(()=>{
            //   this.fetchChildren();
            // }).catch((err)=>{
            //   this.get('cs').log('error updating doc', err);
            // });
          }
      }
    },
    submitOp: function (op, retry = 0) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        const doc = this.get('currentDoc');
        const error = () => {
          this.reloadDoc();
          this.get('cs').log("FAKE error submitting op (ws)");
          reject();
        };
        if (this.get('wsAvailable')) {
          const sharedDBDoc = this.get('sharedDBDoc');
          //For testing purposes!!! definietly keep commented!!!
          //if(Math.random()>0.1) {
          if (true) {
            try {
              //this.get('cs').log("Submitting op on ws")
              sharedDBDoc.submitOp(op, err => {
                //this.get('cs').log("callback", err)
                if (!Ember.isEmpty(err) && op.p[0] !== "trig") {
                  error();
                  return;
                } else {
                  resolve();
                  return;
                }
              });
            } catch (err) {
              this.get('cs').log("catch", err);
              if (op.p[0] !== "trig") {
                error();
                return;
              } else {
                resolve();
                return;
              }
            }
          } else {
            //This is the else for a place where we simulate failed ops submissions
            error();
            return;
          }
        } else {
          console.log("WARNING, websockets failed, attempting https to send op");
          this.get('documentService').submitOp(op, doc.id).then(() => {
            this.get('cs').log("did sumbit op", op);
            resolve();
            return;
          }).catch(err => {
            this.get('cs').log("ERROR Not submitted");
            error();
            return;
          });
        }
      });
    },
    doPlayOnLoad: function () {
      let model = this.get('model');
      const embed = this.get('isEmbedded');
      if (embed) {
        return true;
      }
      return model.get('dontPlay') === "false" || !model.get('dontPlay');
    },
    preloadAssets: function () {
      this.get('cs').log('preloadAssets');
      return new Ember.RSVP.Promise((resolve, reject) => {
        let model = this.get('model');
        if (!Ember.isEmpty(model.get('assets'))) {
          this.set("hudMessage", "Loading assets...");
          this.set("showHUD", true);
          this.get('assetService').preloadAssets(model.get('assets'), model.id).then(() => {
            this.showFeedback("");
            this.set("showHUD", false);
            resolve();
          }).catch(err => {
            this.showFeedback("");
            this.set("showHUD", false);
            reject(err);
          });
        } else {
          resolve();
        }
      });
    },
    getSelectedText: function () {
      const doc = this.get('editor').getDoc();
      let selection = doc.getSelection();
      if (selection.length === 0) {
        const line = this.get('editor').getCursor(true).line;
        selection = doc.getLine(line);
        this.get('cs').log(this.get('editor').getCursor(true), doc.getLine(line));
      }
      return selection;
    },

    updateIFrame: function (selection = false) {
      this.updateSourceFromSession().then(() => {
        this.fetchChildren().then(() => {
          this.updateSavedVals();
          const savedVals = this.get('savedVals');
          let model = this.get('model');
          const mainText = this.get('model.source');
          let toRender = selection ? this.getSelectedText() : mainText;
          this.get('documentService').getCombinedSource(model.id, true, toRender, savedVals).then(combined => {
            this.get('cs').clear();
            if (selection) {
              const pos = this.flashSelectedText();
              this.get('cs').log("NEW EVAL", combined);
              let doSend = true;
              try {
                document.getElementById("output-iframe").contentWindow.eval(combined);
              } catch (err) {
                console.log("ERROR EVAL", err);
                doSend = false;
              }
              if (doSend) {
                //We send the uncombined raw text (eg without base64 assets etc..),
                //and convert on the other side
                const toSend = {
                  uuid: this.get('sessionAccount').getSessionID(),
                  code: toRender,
                  pos: pos,
                  date: new Date().getTime()
                };
                this.set('evalPtr', this.get('evalPtr') + 1);
                let op = {
                  p: ["newEval"],
                  oi: toSend
                };
                console.log("sending op", op);
                //Send then immediately delete
                this.submitOp(op).then(() => {
                  let op = {
                    p: ["newEval"],
                    od: toSend
                  };
                  this.submitOp(op);
                }).catch(err => {
                  this.get('cs').log('error updating doc', err);
                });
                this.set('prevEval', toSend);
              }
            } else {
              combined = this.get('documentService').addRecording(combined, this.get('recordingOptions'));
              this.writeIframeContent(combined);
            }
          });
        }).catch(err => {
          this.get('cs').log(err);
        });
      }).catch(err => {
        this.get('cs').log(err);
      });
    },
    writeIframeContent: function (src) {
      const viewer = document.getElementById("output-iframe");
      if (!Ember.isEmpty(viewer)) {
        const cd = viewer.contentDocument;
        if (!Ember.isEmpty(cd)) {
          const parent = document.getElementById("output-container");
          const newIframe = document.createElement('iframe');
          newIframe.setAttribute("id", "output-iframe");
          newIframe.setAttribute("title", "output-iframe");
          newIframe.setAttribute("name", this.get("iframeTitle"));
          parent.appendChild(newIframe);
          const newCd = newIframe.contentDocument;
          newCd.open();
          try {
            newCd.write(src);
          } catch (err) {
            this.get('cs').log("error running code", err);
          }
          newCd.close();

          const delay = src == "" ? 0 : 10;
          viewer.setAttribute("id", "output-iframe-gone");
          setTimeout(() => {
            cd.open();
            try {
              cd.write("");
            } catch (err) {
              this.get('cs').log("error running code", err);
            }
            cd.close();
            viewer.parentNode.removeChild(viewer);
          }, delay);
        }
      }
    },
    flashAutoRender: function () {
      // let autoInput = document.getElementsByClassName('CodeMirror').item(0)
      // autoInput.style["border-style"] = "solid"
      // autoInput.style["border-width"] = "5px"
      // autoInput.style["border-color"] = 'rgba(255, 102, 255, 150)'
      // setTimeout(()=> {
      //     autoInput.style["border-style"] = "none"
      // }, 250);
    },
    flashSelectedText: function (pos) {
      const editor = this.get('editor');
      let start = editor.getCursor(true);
      let end = editor.getCursor(false);
      if (Ember.isEmpty(pos)) {
        if (start.line == end.line && start.ch == end.ch) {
          this.get('cs').log("flash, single line");
          start = { line: start.line, ch: 0 };
          end = { line: end.line, ch: editor.getLine(end.line).length };
          this.get('cs').log("flash", start, end);
        }
      } else {
        start = pos.start;
        end = pos.end;
      }
      this.get('cs').log("flash", start, end);
      const marker = editor.getDoc().markText(start, end, { "className": "codeMirrorMarked" });
      setTimeout(() => {
        marker.clear();
      }, 500);
      return { start: start, end: end };
    },
    onCodingFinished: function () {
      if (this.get('autoRender')) {
        this.flashAutoRender();
        //this.writeIframeContent("");
        this.updateIFrame();
      }
      this.set('codeTimer', null);
    },
    restartCodeTimer: function () {
      if (this.get('codeTimer')) {
        clearTimeout(this.get('codeTimer'));
      }
      this.set('codeTimer', setTimeout(() => {
        this.onCodingFinished();
      }, this.get('codeTimerRefresh')));
    },
    onSessionChange: function (delta) {
      //dont send up the op if we're embedded (allows local code changes)
      if (this.get("isEmbeddedWithCode")) {
        return;
      }
      const surpress = this.get('surpress');
      const doc = this.get('currentDoc');
      const editor = this.get('editor');
      if (this.get('highContrast')) {
        this.setAllCodeWhite();
      }
      //this.get('cs').log("session change, surpress", surpress);
      if (!surpress && delta[0].origin !== "playback" && this.get('droppedOps').length == 0 && this.get("canEditSource")) {
        this.incrementProperty('editCtr');

        const ops = this.get('codeParser').getOps(delta, editor);
        ops.forEach(op => {
          this.submitOp(op).catch(err => {
            this.get('cs').log("error submitting op");
          });
        });
        if (Ember.isEmpty(doc.type)) {
          this.setLanguage();
        }
        this.get('opsPlayer').reset(doc.id);
        this.restartCodeTimer();
      }
    },
    addWindowListener: function () {
      this.removeWindowListener();
      var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
      var eventer = window[eventMethod];
      window.self = this;
      var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";
      eventer(messageEvent, this.handleWindowEvent, false);
      window.onclick = function (event) {
        if (!event.target.matches('.dropbtn')) {
          var dropdowns = document.getElementsByClassName("dropdown-content");
          var i;
          for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
              openDropdown.classList.remove('show');
            }
          }
        }
      };
    },
    removeWindowListener: function () {
      var eventMethod = window.removeEventListener ? "removeEventListener" : "detachEvent";
      var eventer = window[eventMethod];
      window.self = null;
      var messageEvent = eventMethod === "detachEvent" ? "onmessage" : "message";
      eventer(messageEvent, this.handleWindowEvent, false);
    },
    handleWindowEvent: e => {
      const self = e.target.self;
      const drag = self.get('showCodeControls');
      if (e.origin === _environment.default.localOrigin && drag && !Ember.isEmpty(e.data)) {
        if (e.data[0].substring(0, 2) == "p_") {
          let savedVals = self.get('savedVals');
          savedVals[e.data[0]] = e.data[1];
          // if(this.get('isCollaborative'))
          // {
          //   let code = e.data[0] + " = " + e.data[1];
          //   self.get('documentService').updateDoc(self.model.id, 'newEval', code)
          //   .catch((err)=>{
          //     self.get('cs').log('error updating doc', err);
          //   });
          // }
          self.set('savedVals', savedVals);
          //this.get('cs').log(e.data[0], e.data[1])
        } else if (e.data[0] === "console") {
          for (let i = 1; i < e.data.length; i++) {
            self.get('cs').logToScreen(e.data[i]);
          }
        } else if (e.data[0] === "fl_stats") {
          self.get('documentService').updateDoc(self.get('model.id'), 'stats', e.data).then(() => {
            self.printFl(self);
          });
        }
      }
    },
    printFl: function (self) {
      self.get('opsPlayer').loadOps().then(ops => {
        ops.forEach(op => {
          if (op.op !== undefined) {
            if (op.op[0].p[0] === "stats" && op.op[0].oi[0] === "fl_stats") {
              self.get('cs').log(op.op[0].oi[1]);
            }
          }
        });
      });
    },
    update: function () {
      this.set('consoleOutput', this.get('cs').output);
      var textarea = document.getElementById('console');
      textarea.scrollTop = textarea.scrollHeight;
    },
    isCollaborator: function () {
      let currentUserName = this.get('sessionAccount').currentUserName;
      if (Ember.isEmpty(currentUserName)) {
        currentUserName = "";
      }
      currentUserName = currentUserName.toLowerCase();
      let collaborators = this.get("model.collaborators").map(i => i.toLowerCase());
      if (!Ember.isEmpty(collaborators)) {
        const isCollaborator = collaborators.includes(currentUserName) && this.get("model.isCollaborative");
        return isCollaborator;
      }
      return false;
    },
    setCanEditDoc: function () {
      const currentUser = this.get('sessionAccount').currentUserId;
      let currentUserName = this.get('sessionAccount').currentUserName;
      if (Ember.isEmpty(currentUserName)) {
        currentUserName = "";
      }
      let model = this.get('model');
      this.get('cs').log("setCanEditDoc");
      //If embedded, allow editting (ops dont get sent)
      if (this.get("isEmbeddedWithCode")) {
        this.set('canEditSource', true);
        this.set('showReadOnly', false);
        this.set('isOwner', false);
        return;
      }
      //Noone signed in
      if (Ember.isEmpty(currentUser) || Ember.isEmpty(model)) {
        this.get('cs').log("NO USER OR MODEL");
        this.set('canEditSource', false);
        this.set('canEditSettings', false);
        this.set('showReadOnly', true);
        this.set('isOwner', false);
        return;
      }
      //Someone signed in but not the owner
      if (currentUser !== model.get('ownerId')) {
        this.get('cs').log("NOT OWNER");
        this.set('isOwner', false);
        let isCollaborator = this.isCollaborator();
        this.get('cs').log(this.get("model.collaborators"), currentUserName);
        this.get('cs').log("isCollaborator", isCollaborator);
        this.set('canEditSettings', false);
        //Not owner but read only
        if (model.get('readOnly')) {
          this.set('canEditSource', isCollaborator);
          this.set('showReadOnly', !isCollaborator);
        } else {
          //not owner by and not read only
          this.set('canEditSource', true);
          this.set('showReadOnly', false);
        }
        return;
      } else {
        //signed in and is the owner
        this.set('isOwner', true);
        this.set('canEditSource', true);
        this.set('canEditSettings', true);
        this.set('showReadOnly', false);
        this.get('cs').log("IS OWNER");
        return;
      }
      //Never gets here?
      this.get('cs').log("IS DESKTOP?", this.get('mediaQueries.isDesktop'));
      this.set('showReadOnly', false);
      if (!this.get('mediaQueries.isDesktop')) {
        this.set('canEditSource', false);
        this.set('canEditSettings', false);
      }
    },
    deleteCurrentDocument: function () {
      let model = this.get('model');
      if (confirm('Are you sure you want to delete?')) {
        this.get('cs').log("deleting root doc");
        this.get('documentService').deleteDoc(model.id).then(() => {
          this.get('cs').log("completed deleting root doc and all children + assets");
          this.transitionToRoute('application');
        }).catch(err => {
          this.get('cs').log("error deleting doc", err);
        });
      }
    },
    resetScrollPositions: function () {
      var scrollPositions = {};
      scrollPositions[this.get('model').id] = 0;
      this.get('children').forEach(child => {
        scrollPositions[child.id] = 0;
      });
      this.set('scrollPositions', scrollPositions);
    },
    updateScrollPosition: function () {
      this.get('scrollPositions')[this.get('currentDoc').id] = this.get('editor').getCursor(true);
    },
    scrollToSavedPosition: function () {
      const pos = this.get('scrollPositions')[this.get('currentDoc').id];
      this.get('editor').scrollIntoView(pos);
    },
    /*
    This is necessary as the output container has to have an abolsute position
    otherwise when you use anchor links in Chrome, things get weird. This means when
    we do stuff like drop downs or scroll bars appearing, the code container shifts
    down appropirately but the output doesnt. We use this method to keep them in sync
    */
    syncOutputContainer: function () {
      setTimeout(() => {
        const ace = $("#ace-container");
        if (!Ember.isEmpty(ace)) {
          document.getElementById("output-container").style.top = ace.offset().top + "px";
        }
      }, 50);
    },
    updateDragPos: function () {
      this.syncOutputContainer();
      const codeW = parseInt(this.get('codeW').substring(0, this.get('codeW').length - 2));
      const drag = document.getElementById('drag-container');
      if (!Ember.isEmpty(drag)) {
        drag.style.right = codeW - 31 + "px";
      }
      const tab = document.getElementById('project-tabs');
      if (!Ember.isEmpty(tab)) {
        tab.style.width = codeW + "px";
      }
      const editor = this.get('editor');
      if (!Ember.isEmpty(editor)) {
        editor.refresh();
        if (this.get('highContrast')) {
          this.setAllCodeWhite();
        }
      }
    },
    skipOp: function (prev, rewind = false) {
      const update = () => {
        return new Ember.RSVP.Promise((resolve, reject) => {
          const editor = this.get('editor');
          this.set('surpress', true);
          //this.get('cs').log("SURPRESSING");
          if (prev) {
            this.get('opsPlayer').prevOp(editor, rewind).then(() => {
              resolve();
            });
          } else {
            this.get('opsPlayer').nextOp(editor, rewind).then(() => {
              resolve();
            });
          }
        });
      };
      update().then(() => {
        this.set('surpress', false);
        this.get('cs').log("UNSURPRESSING");
      });
    },
    updateSavedVals: function () {
      return new Ember.RSVP.Promise((resolve, reject) => {
        const savedVals = this.get('savedVals');
        if (Ember.isEmpty(savedVals)) {
          resolve();
          return;
        } else {
          const vals = Object.keys(savedVals).map(key => savedVals[key]);
          const hasVals = vals.length > 0;
          if (hasVals) {
            this.get('documentService').updateDoc(this.get('model').id, 'savedVals', savedVals).then(() => resolve()).catch(err => reject(err)).catch(err => {
              this.get('cs').log('error updating doc', err);
              reject(err);
              return;
            });
          } else {
            resolve();
          }
        }
      });
    },
    updateEditStats: function () {
      return new Ember.RSVP.Promise((resolve, reject) => {
        let model = this.get('model');
        let stats = model.get('stats') ? model.get('stats') : { views: 0, forks: 0, edits: 0 };
        stats.edits = parseInt(stats.edits) + this.get('editCtr');
        const actions = [this.get('documentService').updateDoc(model.id, 'stats', stats)];
        if (this.get('isOwner')) {
          this.get('cs').log("updating lastEdited (i own this)");
          actions.push(this.get('documentService').updateDoc(model.id, 'lastEdited', new Date()));
        }
        Promise.all(actions).then(() => {
          this.set('editCtr', 0);
          resolve();
        }).catch(err => {
          reject(err);
        });
      });
    },
    refreshDoc: function () {
      const doc = this.get('currentDoc');
      if (!Ember.isEmpty(doc)) {
        const fn = () => {
          this.set('titleName', "");
          this.get('opsPlayer').reset(doc.id);
          this.set('showConnectionWarning', false);
          this.set('droppedOps', []);
          this.set('recordingOptions', { isRecording: false });
          this.writeIframeContent("");
          this.cleanUpShareDB();
          this.cleanUpOpPlayer();
          this.set('currentDoc', null);
          if (!Ember.isEmpty(this.get('editor'))) {
            this.get("cs").log("selectRootDoc", "refreshDoc");
            this.selectRootDoc();
          }
        };
        const actions = [this.updateSourceFromSession(), this.updateEditStats(), this.updateSavedVals()];
        Promise.all(actions).then(() => {
          fn();
        }).catch(() => {
          fn();
        });
      }
    },
    showFeedback: function (msg) {
      this.set('feedbackMessage', msg);
      if (!Ember.isEmpty(this.get('feedbackTimer'))) {
        clearTimeout(this.get('feedbackTimer'));
        this.set('feedbackTimer', null);
      }
      this.set('feedbackTimer', setTimeout(() => {
        this.set('feedbackMessage', null);
      }, 5000));
    },
    pauseOps: function () {
      this.set('isPlayingOps', false);
      if (this.get('opsInterval')) {
        clearInterval(this.get('opsInterval'));
      }
    },
    playOps: function () {
      this.pauseOps();
      this.set('isPlayingOps', true);
      this.set('opsInterval', setInterval(() => {
        this.skipOp(false);
        if (this.get('opsPlayer').reachedEnd) {
          this.set('isPlayingOps', false);
          clearInterval(this.get('opsInterval'));
        }
      }, 100));
    },
    hijackConsoleOutput: function () {
      (() => {
        let oldLog = this.get('cs').log;
        this.get('cs').log = msg => {
          if (_environment.default.debugConsole) {
            this.set("consoleOutput", this.get('consoleOutput') + "\n" + JSON.stringify(msg));
            console.log(msg);
          }
        };
        var oldWarn = console.warn;
        console.warn = msg => {
          this.set("consoleOutput", this.get('consoleOutput') + "\n" + msg);
          console.warn(msg);
        };
        var oldError = console.error;
        console.error = msg => {
          console.log("ERRRERERER");
          this.set("consoleOutput", this.get('consoleOutput') + "\n" + msg);
          console.error(msg);
        };
      })();
    },
    updatePlayButton: function () {
      let update = button => {
        if (!Ember.isEmpty(button)) {
          if (!this.get('doPlay')) {
            $(button).find(".glyphicon").removeClass("glyphicon-play").addClass("glyphicon-pause");
          } else {
            $(button).find(".glyphicon").removeClass("glyphicon-pause").addClass("glyphicon-play");
          }
        }
      };
      update(document.getElementById("code-play-btn"));
      update(document.getElementById("embedded-run-button"));
    },
    updateTabbarLocation: function () {
      const codeW = this.get('codeW');
      let tab = document.getElementById('project-tabs');
      if (tab) {
        tab.style.width = codeW;
      }
    },
    foldHead: function () {
      const editor = this.get('editor');
      this.get('cs').log("FOLDING HEAD");
      editor.operation(() => {
        for (var l = editor.firstLine(); l <= editor.lastLine(); ++l) {
          if (editor.doc.getLine(l).includes("<head>")) {
            this.get('cs').log("FOLDING HEAD FOUND ELEMENT");
            editor.foldCode({ line: l, ch: 0 }, null, "fold");
          }
        }
      });
    },
    hideCode: function (doHide) {
      let container = document.getElementById('ace-container');
      container.classList.add(doHide ? 'hiding-code' : 'showing-code');
      container.classList.remove(!doHide ? 'hiding-code' : 'showing-code');
      this.set("isDragging", false);
      const tab = document.getElementById("project-tabs");
      if (!Ember.isEmpty(tab)) {
        tab.classList.add(doHide ? 'hiding-code' : 'showing-code');
        tab.classList.remove(!doHide ? 'hiding-code' : 'showing-code');
      }
      setTimeout(() => {
        const proportion = this.get("isEmbeddedWithCode") ? 0.9 : 0.65;
        const w = window.innerWidth * proportion + "px";
        this.set('isShowingCode', !doHide);
        this.get('cs').log("setting codeW to ", doHide ? "30px" : w);
        this.set('codeW', doHide ? "30px" : w);
        const editor = this.get('editor');
        if (!Ember.isEmpty(editor) && !doHide) {
          console.log("refresh");
          editor.refresh();
          setTimeout(() => {
            console.log("refresh");
            editor.refresh();
            editor.refresh();
            editor.refresh();
            editor.refresh();
          }, 1000);
        }
      }, 200);
    },
    setAllCodeWhite() {
      document.querySelectorAll('#ace-container').forEach(el => el.querySelectorAll('span').forEach(el => el.style.color = 'white'));
    },
    showProject() {
      //this.transitionToRoute("code-editor", this.get("model.id"))
      //this.transitionToRoute("about")
    },
    alertAssetsUpdated(newAssets) {
      const toSend = {
        uuid: this.get('sessionAccount').getSessionID(),
        assets: newAssets,
        date: new Date().getTime()
      };
      let op = {
        p: ["assetsUpdated"],
        oi: toSend
        //Delete after send
      };this.submitOp(op).then(() => {
        let op = {
          p: ["assetsUpdated"],
          od: toSend
        };
        this.submitOp(op);
      }).catch(err => {
        this.get('cs').log('error updating doc', err);
      });
    },
    actions: {

      //codemirror
      onEditorReady(editor) {
        this.set('editor', editor);
        let elements = document.getElementsByClassName("CodeMirror");
        elements[0].style.fontSize = "12pt";
        this.get('editor').on('scroll', cm => {
          if (this.get('highContrast')) {
            this.setAllCodeWhite();
          }
        });
        this.begin();
      },
      onSessionChange(cm, change) {
        this.set('editor', cm);
        this.onSessionChange(change);
      },
      onReevaluate() {
        if (this.get("canEditSource")) {
          this.updateIFrame(true);
        }
      },

      suggestCompletions(editor, options) {
        this.get('cs').log("CUSTOM COMPLETIONS");
        let targets = [];
        const assets = this.get('model.assets');
        if (!Ember.isEmpty(assets)) {
          targets = targets.concat(this.get('autocomplete').assets(assets));
        }
        const children = this.get('children');
        if (!Ember.isEmpty(children)) {
          targets = targets.concat(this.get('autocomplete').tabs(children));
        }

        return this.get('autocomplete').toFind(editor, options, targets);
      },

      //DOC PROPERTIES
      collaboratorsChanged(users) {
        this.get('documentService').updateDoc(this.get('model').id, 'collaborators', users).then(() => {
          this.reloadDoc();
        }).catch(err => {
          this.get('cs').log('error updating doc', err);
        });
      },
      searchCollaborator(user) {
        this.get('cs').log("search Collaborator", user);
        this.transitionToRoute('documents', user, 0, "views");
      },
      tagsChanged(tags) {
        this.get('documentService').updateDoc(this.get('model').id, 'tags', tags).catch(err => {
          this.get('cs').log('error updating doc', err);
        });
      },
      searchTag(tag) {
        this.get('cs').log("search tag", tag);
        this.transitionToRoute('documents', tag, 0, "views");
      },
      syncOutputContainer() {
        this.get('cs').log("syncOutputContainer");
        setTimeout(() => {
          this.syncOutputContainer();
        }, 50);
      },
      doEditDocName() {
        if (this.get('canEditSettings')) {
          this.set('isNotEdittingDocName', false);
          Ember.run.scheduleOnce('afterRender', function () {
            $('#doc-name-input').focus();
          });
        }
      },
      endEdittingDocName() {
        this.set('isNotEdittingDocName', true);
        const newName = this.get('titleNoName');
        this.set('titleName', newName + " by " + this.get('model.owner'));
        this.get('documentService').updateDoc(this.get('currentDoc').id, 'name', newName).then(() => this.fetchChildren().then(() => this.get('sessionAccount').updateOwnedDocuments()));
      },
      deleteDoc() {
        if (this.get('canEditSettings')) {
          this.deleteCurrentDocument();
        }
      },
      download() {
        this.get('assetService').zip();
      },
      flagDocument() {
        this.get('documentService').flagDoc().then(() => {
          let model = this.get('model');
          let flags = parseInt(model.get('flags'));
          if (flags < 2) {
            flags = flags + 1;
            this.get('documentService').updateDoc(model.id, 'flags', flags).catch(err => {
              this.get('cs').log('error updating doc', err);
            });
          } else {
            this.deleteCurrentDocument();
          }
        }).catch(err => {
          alert("Already flagged");
        });
      },
      forkDocument() {
        this.fetchChildren().then(() => {
          const currentUser = this.get('sessionAccount').currentUserName;
          let model = this.get('model');
          let stats = model.get('stats') ? model.get('stats') : { views: 0, forks: 0, edits: 0 };
          stats.forks = parseInt(stats.forks) + 1;
          let actions = [this.get('documentService').updateDoc(model.id, 'stats', stats), this.get('documentService').forkDoc(model.id, this.get('children'))];
          Promise.all(actions).then(() => {
            this.get('sessionAccount').updateOwnedDocuments().then(() => {
              this.get('cs').log("owneddocs", this.get('sessionAccount').ownedDocuments);
              this.transitionToRoute('code-editor', this.get('sessionAccount').ownedDocuments.firstObject.id);
            }).catch(err => {
              this.set('feedbackMessage', err.errors[0]);
            });
            this.showFeedback("Here is your very own new copy!");
          }).catch(err => {
            this.set('feedbackMessage', err.errors[0]);
          });
        });
      },

      //ASSETS
      assetError(err) {
        document.getElementById("asset-progress").style.display = "none";
        alert("Error uploading there is a 100MB limit to assets");
      },
      assetProgress(e) {
        this.get('cs').log("assetProgress", e.percent);
        const prog = document.getElementById("asset-progress");
        if (parseInt(e.percent) < 100) {
          prog.style.display = "block";
          prog.style.width = parseInt(e.percent) + "%";
        } else {
          prog.style.display = "none";
        }
      },
      assetUploaded(e) {
        this.get('cs').log("assetComplete", e);
        document.getElementById("asset-progress").style.display = "none";
        const doc = this.get('model');
        let newAssets = doc.assets;
        newAssets.push(e);
        const actions = [this.get('documentService').updateDoc(doc.id, "assets", newAssets), this.get('documentService').updateDoc(doc.id, "assetQuota", e.size + doc.get('assetQuota'))];

        Promise.all(actions).then(() => {
          this.alertAssetsUpdated(newAssets);
          if (!this.get('wsAvailable')) {
            this.refreshDoc();
          }
        }).catch(err => {
          this.get('cs').log('ERROR updating doc with asset', err);
        });
      },
      assetUploadingComplete() {
        this.get('cs').log("all uploads complete");
        document.getElementById("uploaded-assets-container").style['background-color'] = 'yellow';
        setTimeout(() => {
          document.getElementById("uploaded-assets-container").style['background-color'] = 'inherit';
        }, 500);
      },
      deleteAsset(asset) {
        if (this.get('canEditSource')) {
          if (confirm('Are you sure you want to delete?')) {
            this.get('cs').log("deleting asset", asset);
            this.get('assetService').deleteAsset(asset).then(() => {
              const doc = this.get('model');
              let newAssets = doc.get('assets');
              newAssets = newAssets.filter(oldAsset => {
                this.get('cs').log(oldAsset.name, asset);
                return oldAsset.name !== asset;
              });
              let totalSize = 0;
              newAssets.forEach(a => {
                totalSize += a.size;
              });
              const actions = [this.get('documentService').updateDoc(doc.id, "assets", newAssets), this.get('documentService').updateDoc(doc.id, "assetQuota", totalSize)];
              Promise.all(actions).then(() => {
                this.alertAssetsUpdated(newAssets);
                if (!this.get('wsAvailable')) {
                  this.refreshDoc();
                }
              }).catch(err => {
                this.get('cs').log(err);
              });
            }).catch(err => {
              this.get('cs').log('ERROR deleting asset', err, asset);
            });
          }
        }
      },
      previewAsset(asset) {
        var url = _environment.default.serverHost + "/asset/" + this.get('model').id + "/" + asset.name;
        const isImage = asset.fileType.includes("image");
        const isAudio = asset.fileType.includes("audio");
        const isVideo = asset.fileType.includes("video");
        this.get('modalsManager').alert({ title: asset.name,
          bodyComponent: 'modal-preview-body',
          assetURL: url,
          assetType: asset.fileType,
          isImage: isImage,
          isAudio: isAudio,
          isVideo: isVideo });
        this.toggleProperty('showPreview');
      },
      //SHOW AND HIDE MENUS
      togglePrivacy() {
        if (this.get('canEditSettings')) {
          let model = this.get('model');
          model.set('isPrivate', !model.get('isPrivate'));
          this.get('documentService').updateDoc(model.id, 'isPrivate', model.get('isPrivate')).catch(err => {
            this.get('cs').log('error updating doc', err);
          });
        }
      },
      toggleReadOnly() {
        if (this.get('canEditSettings')) {
          let model = this.get('model');
          model.set('readOnly', !model.get('readOnly'));
          this.get('documentService').updateDoc(model.id, 'readOnly', model.get('readOnly')).catch(err => {
            this.get('cs').log('error updating doc', err);
          });
        }
      },
      toggleDontPlay() {
        if (this.get('isOwner')) {
          let model = this.get('model');
          model.set('dontPlay', !model.get('readOnly'));
          this.get('documentService').updateDoc(model.id, 'dontPlay', model.get('readOnly')).catch(err => {
            this.get('cs').log('error updating doc', err);
          });
        }
      },
      toggleAutoRender() {
        this.toggleProperty('autoRender');
      },
      toggleCollaborative() {
        if (this.get('canEditSettings')) {
          let model = this.get('model');
          model.set('isCollaborative', !model.get('isCollaborative'));
          const checkbox = document.getElementById("colab-checkbox");
          if (model.get('isCollaborative')) {
            checkbox.classList.add("orange-checkbox");
          } else {
            checkbox.classList.remove("orange-checkbox");
          }
          this.get('documentService').updateDoc(model.id, 'isCollaborative', model.get('isCollaborative')).then(() => {
            this.reloadDoc();
          }).catch(err => {
            this.get('cs').log('error updating doc', err);
          });
        }
      },
      toggleShowSettings() {
        this.toggleProperty('showSettings');
        this.syncOutputContainer();
      },
      toggleLibraryDropdown() {
        document.getElementById("myDropdown").classList.toggle("show");
      },
      insertLibrary(lib) {
        this.updateSourceFromSession().then(() => {
          const op = this.get('codeParser').insertLibrary(lib.id, this.get('model.source'));
          this.submitOp(op);
          this.set('surpress', true);
          const deltas = this.get('codeParser').applyOps([op], this.get('editor'));
          this.set('surpress', false);
          document.getElementById("myDropdown").classList.toggle("show");
        });
      },
      toggleShowShare() {
        this.toggleProperty('showShare');
      },
      toggleShowRecordingPanel() {
        this.updateSourceFromSession().then(() => {
          this.fetchChildren().then(() => {
            this.get('documentService').getCombinedSource(this.get('model.id'), true, this.get('model.source'), this.get('savedVals')).then(combined => {
              this.set('possibleRecordingNodes', this.get('codeParser').getPossibleNodes(combined));
              this.get('cs').log('possibleRecordingNodes', this.get('possibleRecordingNodes'));
              this.toggleProperty('showRecordingPanel');
              this.syncOutputContainer();
            });
          });
        });
      },
      onRecordingOptionsChanged(options) {
        this.get('cs').log("rec options", options);
        this.set('recordingOptions', options);
      },
      toggleShowAssets() {
        this.toggleProperty('showAssets');
        this.get('cs').log(this.get('showAssets'));
        this.syncOutputContainer();
      },
      enterFullscreen() {
        document.onfullscreenchange = event => {
          if (document.fullscreenElement) {
            console.log(`Element: ${document.fullscreenElement.id} entered full-screen mode.`);
            const o = document.getElementById("output-container");
            o.style.left = "0px";
            o.style.width = "100%";
            o.style.height = "100%";
            const m = document.getElementById("main-code-container");
            m.style.height = "100%";
          } else {
            console.log('Leaving full-screen mode.');
            const o = document.getElementById("output-container");
            o.style.left = "8%";
            o.style.width = "84%";
            o.style.height = "80vh";
            const m = document.getElementById("main-code-container");
            m.style.height = "80vh";
            this.syncOutputContainer();
          }
        };
        var target = document.getElementById("fullscreen");
        if (target.requestFullscreen) {
          target.requestFullscreen();
        } else if (target.msRequestFullscreen) {
          target.msRequestFullscreen();
        } else if (target.mozRequestFullScreen) {
          target.mozRequestFullScreen();
        } else if (target.webkitRequestFullscreen) {
          target.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
      },

      //TIDYING UP ON EXIT / REFRESH
      cleanUp() {
        const fn = () => {
          this.get('cs').log("clean up");
          this.set('fetchingDoc', false);
          this.set('showHUD', false);
          this.showFeedback("");
          this.writeIframeContent("");
          this.set('droppedOps', []);
          this.set("consoleOutput", "");
          this.set("titleName", "");
          this.get('cs').clear();
          this.get('cs').clearObservers();
          this.cleanUpOpPlayer();
          if (!Ember.isEmpty(this.get("updateSourceInterval"))) {
            clearInterval(this.get("updateSourceInterval"));
            this.set("updateSourceInterval", null);
          }
          if (this.get('wsAvailable')) {
            this.cleanUpConnections();
          }
          this.set('highContrast', false);
          const logo = document.getElementById("main-logo");
          logo.style.display = "block";
          const log = document.getElementById("login-container");
          log.style.top = "115px";
          this.get('cs').log('cleaned up');
          //this.removeWindowListener();
        };
        this.set('leftCodeEditor', true);
        const actions = [this.updateSourceFromSession(), this.updateEditStats(), this.updateSavedVals()];
        Promise.all(actions).then(() => {
          fn();
        }).catch(() => {
          fn();
        });
      },
      refresh() {
        this.refreshDoc();
      },

      //MOUSE LISTENERS
      mouseDown(e) {
        //this.get('cs').log('mouseDown',e.target);
        this.set('isDragging', true);
        const startWidth = document.querySelector('#ace-container').clientWidth;
        const startX = e.clientX;
        this.set('startWidth', startWidth);
        this.set('startX', startX);
        let overlay = document.querySelector('#output-iframe');
        overlay.style["pointer-events"] = "none";
        let playback = document.querySelector('#playback-container');
        if (!Ember.isEmpty(playback)) {
          playback.style["pointer-events"] = "none";
        }
      },
      mouseUp(e) {
        //this.get('cs').log('mouseup',e.target);
        this.set('isDragging', false);
        let overlay = document.querySelector('#output-iframe');
        overlay.style["pointer-events"] = "auto";
        let playback = document.querySelector('#playback-container');
        if (!Ember.isEmpty(playback)) {
          playback.style["pointer-events"] = "auto";
        }
      },
      mouseMove(e) {
        if (this.get('isDragging')) {
          //this.get('cs').log('mouseMove',e.target);
          this.set('codeW', this.get('startWidth') - e.clientX + this.get('startX') + "px");
        }
      },
      mouseoverCodeTransport(e) {
        const transport = document.getElementById("code-transport-container");
        const trackingArea = document.getElementById("code-transport-tracking-area");
        trackingArea.style["pointer-events"] = "none";
        transport.style.display = "block";
      },
      mouseoutCodeTransport(e) {
        const transport = document.getElementById("code-transport-container");
        const trackingArea = document.getElementById("code-transport-tracking-area");
        trackingArea.style["pointer-events"] = "auto";
        transport.style.display = "none";
      },

      //OPERATIONS ON CODE
      playOrPause() {
        if (this.get('doPlay')) {
          this.updateIFrame();
        } else {
          this.writeIframeContent("");
        }
        this.toggleProperty('doPlay');
        this.updatePlayButton();
      },
      toggleHighContrast() {
        this.toggleProperty('highContrast');
        if (this.get('highContrast')) {
          this.setAllCodeWhite();
          document.getElementById("ace-container").style.opacity = 1.0;
        } else {
          this.get('editor').refresh();
          document.getElementById("ace-container").style.opacity = 0.95;
        }
      },
      renderCode() {
        this.updateIFrame();
      },
      pauseCode() {
        this.writeIframeContent("");
      },
      hideCode() {
        this.hideCode(true);
      },
      showCode() {
        this.hideCode(false);
      },
      showProject() {
        this.get('cs').log("showProject", this.get("model.id"));
      },

      //OP PLAYBACK
      skipOp(prev) {
        this.skipOp(prev);
      },
      rewindOps() {
        this.set('surpress', true);
        this.get('editor').setValue("");
        this.writeIframeContent("");
        this.set('surpress', false);
        this.skipOp(false, true);
      },
      playOps() {
        this.playOps();
      },
      pauseOps() {
        this.pauseOps();
      },
      zoomOut() {
        this.get('editor').refresh();
        if (this.get('highContrast')) {
          this.setAllCodeWhite();
        }
        let elements = document.getElementsByClassName("CodeMirror");
        const currentFontSize = parseInt(elements[0].style.fontSize.substring(0, 2));
        elements[0].style.fontSize = currentFontSize - 1 + "pt";
      },
      zoomIn() {
        this.get('editor').refresh();
        if (this.get('highContrast')) {
          this.setAllCodeWhite();
        }
        let elements = document.getElementsByClassName("CodeMirror");
        const currentFontSize = parseInt(elements[0].style.fontSize.substring(0, 2));
        elements[0].style.fontSize = currentFontSize + 1 + "pt";
      },

      //TABS
      newTab(docId) {
        if (this.get('canEditSettings')) {
          this.get('cs').log('new tab', docId);
          this.fetchChildren().then(() => {
            const children = this.get('model').children;
            const newChild = children[children.length - 1];
            this.resetScrollPositions();
            //this.newDocSelected(newChild);
          });
        }
      },
      tabSelected(docId) {
        this.get('cs').log('tab selected', docId);
        this.updateSourceFromSession().then(() => {
          this.updateScrollPosition();
          const doc = this.get("currentDoc");
          var currentDocId = "";
          if (!Ember.isEmpty(doc)) {
            currentDocId = doc.id;
          }
          if (docId != currentDocId) {
            this.newDocSelected(docId).then(() => {
              this.fetchChildren();
              this.resetOpsPlayer();
            });
          }
        }).catch(err => {
          this.get('cs').log('ERROR', err);
        });
      },
      tabDeleted(docId) {
        if (self.get('isOwner')) {
          this.get('cs').log('deleting tab', docId);
          if (confirm('Are you sure you want to delete?')) {
            //SWITCH TO HOME TAB FIRST
            this.newDocSelected(this.get('model').id).then(() => {
              this.get('documentService').deleteDoc(docId).then(() => {
                const children = this.get('model.children');
                var newChildren = children.filter(c => {
                  return c != docId;
                });
                this.get('documentService').updateDoc(this.get('model').id, "children", newChildren).then(() => {
                  this.get('cs').log("Did delete child from parent model", this.get('model.children'));
                  this.fetchChildren().then(() => {
                    this.resetScrollPositions();
                  });
                }).catch(err => {
                  this.get('cs').log(err);
                });
              }).catch(err => {
                this.get('cs').log(err);
              });
            });
          }
        }
      }
    }
  });
});
;define('ember-share-db/controllers/crash-couse', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Controller.extend({});
});
;define('ember-share-db/controllers/documents', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Controller.extend({
    store: Ember.inject.service(),
    session: Ember.inject.service('session'),
    cs: Ember.inject.service('console'),
    mediaQueries: Ember.inject.service(),
    resizeService: Ember.inject.service('resize'),
    documentService: Ember.inject.service('documents'),
    docName: "",
    isPrivate: true,
    isPrivateText: Ember.computed('isPrivate', function () {
      return this.get('isPrivate') ? "private" : "public";
    }),
    initialSearchValue: Ember.computed('model.filter', {
      set(key, value) {
        return this._initialSearchValue = value;
      },
      get() {
        const fromURL = this.get("model.filter.search");
        return fromURL == " " ? null : fromURL;
      }
    }),
    feedbackMessage: "",
    sort: "views",
    page: 0,
    sessionAccount: Ember.inject.service('session-account'),
    canGoBack: Ember.computed('page', function () {
      return this.get('page') > 0;
    }),
    canGoForwards: Ember.computed('model.docs', function () {
      return this.get('model').docs.length >= 20;
    }),
    hasNoDocuments: Ember.computed('model.docs', function () {
      return this.get('model').docs.length == 0;
    }),
    isMore: true,
    loadMoreCtr: 0,
    sortingFilters: Ember.computed(() => {
      return [{ title: "NEWEST", id: "date", isSelected: false, highlightTitle: false }, { title: "POPULAR", id: "views", isSelected: false, highlightTitle: false }, { title: "MOST REMIXED", id: "forks", isSelected: false, highlightTitle: false }, { title: "MOST EDITED", id: "edits", isSelected: false, highlightTitle: false }];
    }
    // {title:"UPDATED", id:"updated", isSelected:false, highlightTitle:false},
    ),
    init: function () {
      this._super();
      this.set('allFilters', []);
      this.set('showingFilters', []);
      this.get('resizeService').on('didResize', event => {
        this.updateFiltersToShow();
      });
      this.setShowingFilters();
    },
    setShowingFilters() {
      this.get('documentService').getPopularTags(11).then(results => {
        var all = this.get('sortingFilters');
        let tags = results.data.map((t, i) => {
          return {
            title: "#" + t._id, id: "tag-item", isSelected: false, highlightTitle: false
          };
        });
        all = all.concat(tags);
        this.set('allFilters', all);
        this.updateFiltersToShow();
      });
    },
    updateSelectedFilter() {
      var newF = [];
      this.get('showingFilters').forEach(f => {
        Ember.set(f, "isSelected", f.id == this.get('sort'));
        const searchTerm = this.getSearchTerm();
        Ember.set(f, "highlightTitle", f.id == this.get('sort') || f.title == searchTerm);
        newF.push(f);
      });
      Ember.run(() => {
        this.set('showingFilters', newF);
      });
    },
    getSearchTerm() {
      let searchBar = document.getElementById("searchTerm");
      let searchTerm = " ";
      if (!Ember.isEmpty(searchBar)) {
        searchTerm = searchBar.value;
        //Strip uncessary whitespace
        searchTerm = searchTerm.replace(/^\s+|\s+$|\s+(?=\s)/g, "");
      }
      searchTerm = Ember.isEmpty(searchTerm) ? " " : searchTerm;
      return searchTerm;
    },
    updateFiltersToShow() {
      var toShow = 5;
      if (this.get('mediaQueries.isXs')) {
        toShow = 2;
      } else if (this.get('mediaQueries.isSm')) {
        toShow = 3;
      } else if (this.get('mediaQueries.isMd')) {
        toShow = 4;
      }
      toShow += this.get('loadMoreCtr');
      if (toShow >= this.get('allFilters').length) {
        this.set('isMore', false);
        toShow = this.get('allFilters').length;
      } else {
        this.set('isMore', true);
      }
      this.set('showingFilters', this.get('allFilters').slice(0, toShow - 1));
      this.updateSelectedFilter();
    },
    updateResults() {
      document.getElementById("document-container").classList.add("fading-out");
      setTimeout(() => {
        this.get('sessionAccount').getUserFromName();
        let searchBar = document.getElementById("searchTerm");
        const searchTerm = this.getSearchTerm();
        this.get('cs').log('transitionToRoute', 'documents', searchTerm, this.get('page'), this.get('sort'));
        this.updateSelectedFilter();
        this.transitionToRoute('documents', searchTerm, this.get('page'), this.get('sort'));
      }, 400);
    },
    recent() {
      this.set('page', 0);
      this.set('sort', "date");
      this.updateResults();
    },
    popular() {
      this.set('page', 0);
      this.set('sort', "views");
      this.updateResults();
    },
    forked() {
      this.set('page', 0);
      this.set('sort', "forks");
      this.updateResults();
    },
    editted() {
      this.set('page', 0);
      this.set('sort', "edits");
      this.updateResults();
    },
    updated() {
      this.set('page', 0);
      this.set('sort', "updated");
      this.updateResults();
    },
    tag(tag) {
      document.getElementById("searchTerm").value = tag.substr(1);
      this.set('page', 0);
      this.updateResults();
    },
    actions: {
      updateSelectedFilter(sort) {
        this.set('sort', sort);
        this.updateSelectedFilter();
      },
      openDocument(documentId) {
        this.transitionToRoute("code-editor", documentId);
      },
      deleteDocument(documentId) {
        if (confirm('Are you sure you want to delete?')) {
          this.get('documentService').deleteDoc(documentId).then(() => {
            this.get('cs').log("deleted, updating results");
            this.updateResults();
          }).catch(err => {
            this.get('cs').log("error deleting", err);
            this.set('feedbackMessage', err.errors[0]);
          });
        }
      },
      isPrivateChanged() {
        this.toggleProperty('isPrivate');
      },
      createNewDocument() {
        let docName = this.get('docName');
        const isPrivate = this.get('isPrivate');
        this.get('cs').log("new doc", docName);
        if (docName.length > 1) {
          const src = this.get('documentService').getDefaultSource();
          const data = { name: docName, isPrivate: isPrivate, source: src };
          this.get('documentService').makeNewDoc(data).then(() => {
            this.get('cs').log("new doc created");
            const currentUserId = this.get('sessionAccount').currentUserId;
            this.get('store').query('document', {
              filter: { search: docName,
                page: 0,
                currentUser: currentUserId,
                sortBy: 'date' }
            }).then(documents => {
              this.get('cs').log("new doc found, transitioning", documents);
              this.get('sessionAccount').updateOwnedDocuments();
              this.transitionToRoute('code-editor', documents.firstObject.documentId);
            });
          }).catch(err => {
            this.get('cs').log("error making doc", err);
            this.set('feedbackMessage', err);
          });
        } else {
          this.set('feedbackMessage', 'Please enter a name');
        }
      },
      search() {
        this.set('page', 0);
        if (!Ember.isEmpty(this.get('searchTimeout'))) {
          clearTimeout(this.get('searchTimeout'));
        }
        this.set('searchTimeout', setTimeout(() => {
          this.updateResults();
          this.set('searchTimeout', null);
        }, 500));
      },
      nextPage() {
        this.incrementProperty('page');
        this.updateResults();
      },
      prevPage() {
        this.decrementProperty('page');
        this.updateResults();
      },
      filter(f) {
        if (f.id == "forks") {
          this.forked();
        } else if (f.id == "date") {
          this.recent();
        } else if (f.id == "views") {
          this.popular();
        } else if (f.id == "edits") {
          this.editted();
        } else if (f.id == "updated") {
          this.updated();
        } else {
          this.tag(f.title);
        }
      },
      loadMore(numMore) {
        this.set('loadMoreCtr', this.get('loadMoreCtr') + numMore);
        this.updateFiltersToShow();
      },
      loadLess() {
        this.set('loadMoreCtr', 0);
        this.updateFiltersToShow();
      },
      flashResults() {
        const container = document.getElementById("document-container");
        if (!Ember.isEmpty(container)) {
          this.get('cs').log("flashing results");
          container.classList.add("fading-in");
          container.classList.remove("fading-out");
          if (!Ember.isEmpty(this.get('fadeTimeout'))) {
            clearTimeout(this.get('fadeTimeout'));
          }
          this.set('fadeTimeout', setTimeout(() => {
            container.classList.remove("fading-in");
            container.classList.remove("fading-out");
            this.set('fadeTimeout', null);
          }, 500));
        }
      }
    }
  });
});
;define('ember-share-db/controllers/examples', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Controller.extend({
    topic: "",
    cs: Ember.inject.service('console'),
    url: _environment.default.localOrigin,
    isExample: Ember.computed('model', function () {
      this.get('cs').log("isExample", this.get('model'), Array.isArray(this.get('model')));
      return !Array.isArray(this.get('model'));
    }),
    isMagnet: Ember.computed('model', function () {
      this.get('cs').log("example model", this.get('model'));
      return this.get('model').id == "magnet";
    }),
    isBBcut: Ember.computed('model', function () {
      this.get('cs').log(this.get('model'));
      return this.get('model').id == "bbcut";
    }),
    isEvolib: Ember.computed('model', function () {
      this.get('cs').log(this.get('model'));
      return this.get('model').id == "evolib";
    }),
    isMario: Ember.computed('model', function () {
      this.get('cs').log(this.get('model'));
      return this.get('model').id == "mario";
    }),
    isMerk: Ember.computed('model', function () {
      this.get('cs').log(this.get('model'));
      return this.get('model').id == "merk";
    }),
    isMarkov: Ember.computed('model', function () {
      this.get('cs').log(this.get('model'));
      return this.get('model').id == "markov";
    }),
    isAudiotrig: Ember.computed('model', function () {
      return this.get('model').id == "audio-trigger";
    }),
    isFace: Ember.computed('model', function () {
      return this.get('model').id == "facesynth";
    }),
    isRhythm: Ember.computed('model', function () {
      return this.get('model').id == "rhythm-remixer";
    }),
    isConceptular: Ember.computed('model', function () {
      return this.get('model').id == "conceptular";
    }),
    isSpec: Ember.computed('model', function () {
      return this.get('model').id == "specdelay";
    }),
    isLyric: Ember.computed('model', function () {
      return this.get('model').id == "lyrics";
    }),
    isSun: Ember.computed('model', function () {
      return this.get('model').id == "sun-on-your-skin";
    }),
    isKicks: Ember.computed('model', function () {
      return this.get('model').id == "kick-classifier";
    }),
    isSpaceDrum: Ember.computed('model', function () {
      return this.get('model').id == "space-drum";
    }),
    isAutoPilot: Ember.computed('model', function () {
      return this.get('model').id == "auto-pilot";
    }),
    actions: {
      onClick(example) {
        this.transitionToRoute('examples', example.id);
      }
    }
  });
});
;define('ember-share-db/controllers/getting-started', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Controller.extend({
    url: _environment.default.localOrigin + "/images/",
    beginnerProjectUrl: _environment.default.localOrigin + "/code/a7f6b1a0-74a4-236e-f3c1-24962f45213d",
    advancedProjectUrl: _environment.default.localOrigin + "/code/5d9933c7-5c98-217b-b640-64bd9438799f",
    advancedurl: _environment.default.localOrigin + "/getting-started/advanced",
    guideurl: _environment.default.localOrigin + "/guides/root",
    isAdvanced: Ember.computed('model', function () {
      return this.get('model') == "advanced";
    })
  });
});
;define('ember-share-db/controllers/guides', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Controller.extend({
    topic: "",
    cs: Ember.inject.service('console'),
    url: _environment.default.localOrigin,
    isGuide: Ember.computed('model', function () {
      this.get('cs').log(this.get('model'), Array.isArray(this.get('model')));
      return !Array.isArray(this.get('model'));
    }),
    isRAPIDMIX: Ember.computed('model', function () {
      this.get('cs').log(this.get('model'));
      return this.get('model').id == "RAPIDMIX";
    }),
    isMMLL: Ember.computed('model', function () {
      this.get('cs').log(this.get('model'));
      return this.get('model').id == "mmll";
    }),
    isEvolib: Ember.computed('model', function () {
      this.get('cs').log(this.get('model'));
      return this.get('model').id == "evolib";
    }),
    isMaxim: Ember.computed('model', function () {
      this.get('cs').log(this.get('model'));
      return this.get('model').id == "maximJS";
    }),
    isKadenze: Ember.computed('model', function () {
      this.get('cs').log(this.get('model'));
      return this.get('model').id == "kadenze";
    }),
    isLearner: Ember.computed('model', function () {
      this.get('cs').log(this.get('model'));
      return this.get('model').id == "learner";
    }),
    isMaxiInstruments: Ember.computed('model', function () {
      this.get('cs').log("IS MAXI", this.get('model').id == "maxi-instruments");
      return this.get('model').id == "maxi-instrument";
    }),
    isRecording: Ember.computed('model', function () {
      return this.get('model').id == "recording";
    }),
    isColab: Ember.computed('model', function () {
      return this.get('model').id == "colab";
    }),
    isSupervisedML: Ember.computed('model', function () {
      return this.get('model').id == "supervised-ml";
    }),
    actions: {
      onClick(guide) {
        this.transitionToRoute('guides', guide.id);
      }
    }
  });
});
;define('ember-share-db/controllers/inputs', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Controller.extend({
    examples: Ember.computed(() => {
      return [{ title: "Mouse Input", docs: [
        //Mouse
        { docid: "3738a892-330f-15ae-673e-5cb38f25a8e8", desc: "Just the bare minimum recording mouse X and Y" },
        //Series
        { docid: "741e7565-62fb-2998-8bf7-e86f9e365ea8", desc: "Mouse X and Y for Series Classification" }] }, { title: "Audio", docs: [
        //MFCCs
        { docid: "6b8d12a6-9310-1f20-b506-6bb697e6c8de", desc: "Combining MMLL and maximilian.js to get MFCCs, a great timbral feature for classifying audio." },
        //Audio features
        { docid: "c339340d-bd82-f0e1-5929-edb9a206b319", desc: "An example of using Nick Collins MMLL.js library to get a range of audio features from either the microphone or audio file. Features include spectral percentile, sensory dissonance and brightness (spectral centroid)" },
        //Chords
        { docid: "db87ed04-9d7a-5cfc-a218-dd9cc9580929", desc: "An example of using Nick Collins MMLL.js library to get a chords and tempo from either the microphone or audio file. Chords are recorded every time they change, along with the time interval since the last change." },
        //pitch
        { docid: "41a3320b-d2d1-983a-05db-8f9f6ce8d693", desc: "An example of using Nick Collins MMLL.js library to get a pitch and tempo from either the microphone or audio file. Pitch is recorded on each beat." },
        //Chromagram
        { docid: "9be12ec5-4a2b-b4d8-b041-3e589ebaef5f", desc: "A Chromagram example based on Mick Grierson's original code. This splits audio into 12 different classes, closely related to the pitches in equal tempered scales." },
        //Speech to Text
        { docid: "9f28c6b2-eb52-141c-a447-472f2e9e2669", desc: "Using the native in browser speech to text. Each time you speak, the text is transcribed, encoded into a vector and inputted into the dataset / model" }] }, { title: "Video", docs: [
        //Mobilenet
        { docid: "45e317ca-2edb-f7a0-141c-a6e462f9243d", desc: "MobileNet features. This uses a pretrained model (trained on the ImageNet dataset) to provide 1000 features from video that will be useful for typical image classification tasks. Aside: This is what teachable machine uses under the hood" },
        //BodyPix
        { docid: "90def343-a896-31d4-d818-20d89b9bc631", desc: "Uses the BodyPix model to provide full skeleton / body segmentation, possible for multi person" },
        //Posenet
        { docid: "48d5b6d9-794e-97d4-a16e-4780cf6c4a8c", desc: "Uses the ml5 / tensorflow Posenet model to provide full skeleton, possible for multi person" },
        //Emotions
        { docid: "d87b4f42-c131-ca7a-127f-c6df8f475329", desc: "Uses FaceAPI to provide inputs for 9 emotion categories from face analysis" },
        //Coco Object Detection
        { docid: "f0f185b8-4b13-8f83-f815-872d6556c47e", desc: "Uses the Tensorflow Coco object detector. Provides labels and bounding boxes for objects, this example adds the bounding box for any objects identified as people." }] }, { title: "Sensors", docs: [
        //Iphone
        { docid: "674412e2-d4b6-ae40-8d5c-cddc1d271d17", desc: "Connect the motion sensors on your iphone. Requires free Motion sender app (https://apps.apple.com/gb/app/motionsender/id1315005698), values sent over OSC (via websockets)" },
        //Android
        { docid: "c678fa6c-bd17-7d9c-4df1-a92e7b02cb70", desc: "Connect the motion sensors on your Android. Requires free oscHook app (https://play.google.com/store/apps/details?id=com.hollyhook.oscHook), values sent over OSC (via websockets)" },
        //Microbit
        { docid: "f7686716-7c64-c87c-b413-07fb8828fafc", desc: "Connect to a BBC Micro:bit using WebBLE. Records accelerometer values. Code modified from https://github.com/antefact/microBit.js. Visit here to download firmware to upload onto your microbit" }] }, { title: "External", docs: [
        //Microbit
        { docid: "9f017abd-11ea-8d49-6e4f-6b16061cff5b", desc: "Record MIDI CC values into a dataset" }, { docid: "10fe5752-913e-71d8-3fd4-0ec0f0b9f4f3", desc: "Record values sent over OSC (via websockets) into a dataset" }] }, { title: "Text", docs: [
        //Sentiment
        { docid: "62050fce-d4a9-7aaa-e563-51a8992e1d45", desc: "Uses a Sentiment analysis model from Tensorflow. Three text boxes are used as input and their respective sentiments are used as inputs to the model / dataset" },
        //Toxicity
        { docid: "c6c5ab4d-d7fa-a4c5-1793-dc1f99d1f16e", desc: "Uses a Toxicity analysis model from Tensorflow. Text input is used and the respective toxicity probabilities for 7 categories are used as inputs to the model / dataset" }] }];
    }),
    actions: {
      onClick(example) {
        this.transitionToRoute('code-editor', example.docid);
      }
    }
  });
});
;define('ember-share-db/controllers/login', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Controller.extend({
    session: Ember.inject.service('session'),
    sessionAccount: Ember.inject.service('session-account'),
    passwordReset: Ember.inject.service('password-reset'),
    cs: Ember.inject.service('console'),
    store: Ember.inject.service(),
    validateRegistration: function () {
      return new Ember.RSVP.Promise((resolve, reject) => {
        this.clearFeedback();
        let { newUsername, newUserPassword, newUserPasswordAgain } = this.getProperties('newUsername', 'newUserEmail', 'newUserPassword', 'newUserPasswordAgain');
        if (!newUsername || !newUserPassword || !newUserPasswordAgain) {
          reject("please provide correct info");
        }
        if (newUserPassword != newUserPasswordAgain) {
          reject("passwords do not match");
        }
        const badCharacters = ["*", "\"", "\'", "(", ")", ";", ":", "@", "&", "=", "+", "$", ",", "/", "?", "#", "[", "]", "\"", " "];
        badCharacters.forEach(char => {
          if (newUsername.indexOf(char) !== -1) {
            reject("username must be one word (no spaces) and not contain !*'();:@&=+$,/?#[]");
          }
        });
        resolve();
      });
    },
    clearFeedback() {
      this.set('loginErrorMessage', "");
      this.set('registerMessage', "");
    },
    actions: {
      invalidateSession() {
        this.get('session').invalidate();
      },
      authenticate() {
        this.clearFeedback();
        let { identification, password } = this.getProperties('identification', 'password');
        this.get('session').authenticate('authenticator:oauth2', identification, password).then(response => {
          this.get('cs').log("authenticated", response);
          this.set('loginErrorMessage', "authenticated");
        }).catch(err => {
          console.log("authentication failed", err);
          this.set('loginErrorMessage', "authentication failed");
        });
      },
      createNewUser() {
        this.clearFeedback();
        let { newUsername, newUserEmail, newUserPassword, newUserPasswordAgain } = this.getProperties('newUsername', 'newUserEmail', 'newUserPassword', 'newUserPasswordAgain');
        this.get('cs').log(newUsername, newUserEmail, newUserPassword, newUserPasswordAgain);
        this.validateRegistration().then(() => {
          const lowercaseUser = newUsername.toLowerCase();
          let user = this.get('store').createRecord('account', {
            username: lowercaseUser,
            password: newUserPassword,
            email: newUserEmail,
            created: new Date()
          });
          user.save().then(() => {
            this.get('cs').log("user created");
            alert('Your new user account has been created, please sign in to continue');
            this.set('registerMessage', 'Your new user account has been created, please sign in to continue');
          }).catch(err => {
            this.get('cs').log(err);
            this.set('registerMessage', 'Error:' + err);
          });
        }).catch(err => {
          this.set('registerMessage', 'Error:' + err);
        });
      },
      resetPassword() {
        this.clearFeedback();
        let username = this.get('resetUsername');
        this.get('passwordReset').requestReset(username).then(() => {
          this.get('cs').log("password reset");
          this.set('resetMessage', 'Password reset request accepted, please check you email to confirm');
        }).catch(err => {
          this.get('cs').log(err);
          this.set('resetMessage', 'Error:' + err);
        });
      }
    }
  });
});
;define('ember-share-db/controllers/nime2020', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Controller.extend({
    supervisedLearningURL: _environment.default.localOrigin + "/images/supervisedlearning.png",
    mimicSupervisedLearningURL: _environment.default.localOrigin + "/images/supervisedlearninglearnermimic.png",
    demoOneURL: _environment.default.localOrigin + "",
    demoTwoURL: _environment.default.localOrigin + ""
  });
});
;define('ember-share-db/controllers/outputs', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Controller.extend({
    examples: Ember.computed(() => {
      return [{ title: "External", docs: [
        //OSC
        { docid: "247e4538-0366-b735-9052-0e875a96a140", desc: "As you cannot OSC directly from a browser, this connects to a local Node.js program via webosckets then forwards the data out via OSC, where you can do with it what you will." },
        //MIDI
        { docid: "034ea170-483e-229a-f0e2-837d76c721c0", desc: "This uses WebMidi to send the output values as control changes. Note WebMidi is curently only supported in Chrome. You can send to external devices or connect to your internal MIDI bus. First refresh devices, select your output device and channel from the dropdown" }] }, { title: "MaxiInstrument Examples", docs: [
        //Handcode
        { docid: "f6bdb7ad-4cb0-8652-0dee-f0c7db9fede5", desc: "Using AudioWorklet backed synthesiser and sampler. Handcode a sequence to playback on an instrument." },
        //NEXUS
        { docid: "d57c9d9b-284d-9ab3-8118-e7c33eafeeaf", desc: "Using AudioWorklet backed synthesiser and sampler. This allows you use a one-shot sequencer to program a tune yourself, whilst mapping the parameters of the synths to one of the inputs. " },
        //MIDI
        { docid: "73d93516-e0de-a85c-5fc7-c6cc03f4666b", desc: "Using AudioWorklet backed synthesiser and sampler. This uses WebMidi to send the output values as control changes. Note WebMidi is curently only supported in Chrome. You can send to external devices or connect to your internal MIDI bus. First refresh devices, then select your MIDI source from the dropdown" },
        //MIDIFILE
        { docid: "1cc85746-67d2-0cef-7f69-a238c6d2b489", desc: "Using AudioWorklet backed synthesiser and sampler. Upload a MIDI file as an asset andd playback on a MaxiSynth" },
        //MAGENTA
        { docid: "fa99819f-775c-2552-198c-2340739a1b5c", desc: "Using AudioWorklet backed synthesiser and sampler. This shows you how you generate a sequence using Google's Magenta models and plug that straight into a synth" }] }];
    }),
    actions: {
      onClick(example) {
        this.transitionToRoute('code-editor', example.docid);
      }
    }
  });
});
;define('ember-share-db/controllers/password-reset', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Controller.extend({
    queryParams: ['username', 'token'],
    passwordReset: Ember.inject.service('password-reset'),
    cs: Ember.inject.service('console'),
    hasValidToken: false,
    resetMessage: "",
    isTokenValid() {
      let username = this.get('username');
      let token = this.get('token');
      this.get('cs').log('checking valid ', username, token);
      this.get('passwordReset').checkToken(username, token).then(() => {
        this.set('hasValidToken', true);
      }).catch(() => {
        this.set('hasValidToken', false);
      });
    },
    validatePasswords: function () {
      return new Ember.RSVP.Promise((resolve, reject) => {
        let { password, passwordAgain } = this.getProperties('password', 'passwordAgain');
        if (!password || !passwordAgain) {
          reject("please provide correct info");
        }
        if (password != passwordAgain) {
          reject("passwords do not match");
        }
        resolve();
      });
    },
    actions: {
      resetPassword() {
        let password = this.get('password');
        this.validatePasswords().then(() => {
          let username = this.get('username');
          let token = this.get('token');
          this.get('passwordReset').updatePassword(username, token, password).then(() => {
            this.set('resetMessage', 'Password updated successfuly');
          }).catch(err => {
            this.set('resetMessage', 'Error:' + err.responseText);
          });
        }).catch(err => {
          this.set('resetMessage', 'Error:' + err.responseText);
        });
      }
    }
  });
});
;define('ember-share-db/controllers/people', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Controller.extend({
    people: Ember.computed(() => {
      return [{ name: "Mick Grierson", role: "Primary Investigator", imgURL: "https://www.arts.ac.uk/__data/assets/image/0024/168135/1340.png", personalURL: "https://www.arts.ac.uk/research/ual-staff-researchers/mick-grierson" }, { name: "Thor Magnusson", role: "Co Investigator", imgURL: "https://profiles.sussex.ac.uk/p164902-thor-magnusson/photo", personalURL: "https://twitter.com/thormagnusson" }, { name: "Nick Collins", role: "Co Investigator", imgURL: "https://www.dur.ac.uk/images/music/NEW-WEB/staff/Nick-Collins.jpg", personalURL: "https://composerprogrammer.com/" }, { name: "Matthew Yee-King", role: "Co Investigator", imgURL: "https://www.gold.ac.uk/media/images-by-section/departments/computing/research/people/matthew.jpg", personalURL: "http://www.yeeking.net/" }, { name: "Rebecca Fiebrink", role: "Co Investigator", imgURL: "https://www.arts.ac.uk/__data/assets/image/0029/198281/Rebecca.jpg", personalURL: "https://www.arts.ac.uk/creative-computing-institute/people/rebecca-fiebrink" }, { name: "Chris Kiefer", role: "Co Investigator", imgURL: "https://profiles.sussex.ac.uk/p208667-chris-kiefer/photo", personalURL: "https://profiles.sussex.ac.uk/p208667-chris-kiefer" }, { name: "Louis McCallum", role: "Post Doc", imgURL: "https://www.gold.ac.uk/media/images-by-section/departments/computing/LouisMcCallum_380.png", personalURL: "http://louismccallum.com" }, { name: "Shelly Knotts", role: "Post Doc", imgURL: "https://shellyknotts.files.wordpress.com/2019/06/054.jpg?w=1200", personalURL: "https://shellyknotts.wordpress.com/" }, { name: "Francisco Bernardo", role: "Post Doc", imgURL: _environment.default.localOrigin + "/images/francisco.png", personalURL: "https://frantic0.com/" }, { name: "Gabriel Vigliensoni", role: "Post Doc", imgURL: "https://i1.sndcdn.com/avatars-000137340251-uhrx0j-t500x500.jpg", personalURL: "https://www.vigliensoni.com/" }, { name: "Vit Ruzicka", role: "Post Doc", imgURL: "https://people.phys.ethz.ch/~ruzickav/img/vr.jpg", personalURL: "https://people.phys.ethz.ch/~ruzickav/" }];
    }),
    actions: {
      onClick(person) {
        this.transitionToRoute('code-editor', example.docid);
      }
    }
  });
});
;define('ember-share-db/controllers/techyard', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Controller.extend({
    url: _environment.default.localOrigin
  });
});
;define('ember-share-db/controllers/terms', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Controller.extend({
    terms: ""

  });
});
;define('ember-share-db/helpers/-link-to-params', ['exports', 'ember-angle-bracket-invocation-polyfill/helpers/-link-to-params'], function (exports, _linkToParams) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _linkToParams.default;
    }
  });
});
;define('ember-share-db/helpers/abs', ['exports', 'ember-math-helpers/helpers/abs'], function (exports, _abs) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _abs.default;
    }
  });
  Object.defineProperty(exports, 'abs', {
    enumerable: true,
    get: function () {
      return _abs.abs;
    }
  });
});
;define('ember-share-db/helpers/acos', ['exports', 'ember-math-helpers/helpers/acos'], function (exports, _acos) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _acos.default;
    }
  });
  Object.defineProperty(exports, 'acos', {
    enumerable: true,
    get: function () {
      return _acos.acos;
    }
  });
});
;define('ember-share-db/helpers/acosh', ['exports', 'ember-math-helpers/helpers/acosh'], function (exports, _acosh) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _acosh.default;
    }
  });
  Object.defineProperty(exports, 'acosh', {
    enumerable: true,
    get: function () {
      return _acosh.acosh;
    }
  });
});
;define('ember-share-db/helpers/add', ['exports', 'ember-math-helpers/helpers/add'], function (exports, _add) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _add.default;
    }
  });
  Object.defineProperty(exports, 'add', {
    enumerable: true,
    get: function () {
      return _add.add;
    }
  });
});
;define('ember-share-db/helpers/app-version', ['exports', 'ember-share-db/config/environment', 'ember-cli-app-version/utils/regexp'], function (exports, _environment, _regexp) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.appVersion = appVersion;
  function appVersion(_, hash = {}) {
    const version = _environment.default.APP.version;
    // e.g. 1.0.0-alpha.1+4jds75hf

    // Allow use of 'hideSha' and 'hideVersion' For backwards compatibility
    let versionOnly = hash.versionOnly || hash.hideSha;
    let shaOnly = hash.shaOnly || hash.hideVersion;

    let match = null;

    if (versionOnly) {
      if (hash.showExtended) {
        match = version.match(_regexp.versionExtendedRegExp); // 1.0.0-alpha.1
      }
      // Fallback to just version
      if (!match) {
        match = version.match(_regexp.versionRegExp); // 1.0.0
      }
    }

    if (shaOnly) {
      match = version.match(_regexp.shaRegExp); // 4jds75hf
    }

    return match ? match[0] : version;
  }

  exports.default = Ember.Helper.helper(appVersion);
});
;define('ember-share-db/helpers/asin', ['exports', 'ember-math-helpers/helpers/asin'], function (exports, _asin) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _asin.default;
    }
  });
  Object.defineProperty(exports, 'asin', {
    enumerable: true,
    get: function () {
      return _asin.asin;
    }
  });
});
;define('ember-share-db/helpers/asinh', ['exports', 'ember-math-helpers/helpers/asinh'], function (exports, _asinh) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _asinh.default;
    }
  });
  Object.defineProperty(exports, 'asinh', {
    enumerable: true,
    get: function () {
      return _asinh.asinh;
    }
  });
});
;define('ember-share-db/helpers/atan', ['exports', 'ember-math-helpers/helpers/atan'], function (exports, _atan) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _atan.default;
    }
  });
  Object.defineProperty(exports, 'atan', {
    enumerable: true,
    get: function () {
      return _atan.atan;
    }
  });
});
;define('ember-share-db/helpers/atan2', ['exports', 'ember-math-helpers/helpers/atan2'], function (exports, _atan) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _atan.default;
    }
  });
  Object.defineProperty(exports, 'atan2', {
    enumerable: true,
    get: function () {
      return _atan.atan2;
    }
  });
});
;define('ember-share-db/helpers/atanh', ['exports', 'ember-math-helpers/helpers/atanh'], function (exports, _atanh) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _atanh.default;
    }
  });
  Object.defineProperty(exports, 'atanh', {
    enumerable: true,
    get: function () {
      return _atanh.atanh;
    }
  });
});
;define('ember-share-db/helpers/bs-contains', ['exports', 'ember-bootstrap/helpers/bs-contains'], function (exports, _bsContains) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _bsContains.default;
    }
  });
  Object.defineProperty(exports, 'bsContains', {
    enumerable: true,
    get: function () {
      return _bsContains.bsContains;
    }
  });
});
;define('ember-share-db/helpers/bs-eq', ['exports', 'ember-bootstrap/helpers/bs-eq'], function (exports, _bsEq) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _bsEq.default;
    }
  });
  Object.defineProperty(exports, 'eq', {
    enumerable: true,
    get: function () {
      return _bsEq.eq;
    }
  });
});
;define('ember-share-db/helpers/cancel-all', ['exports', 'ember-concurrency/helpers/cancel-all'], function (exports, _cancelAll) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _cancelAll.default;
    }
  });
});
;define('ember-share-db/helpers/cbrt', ['exports', 'ember-math-helpers/helpers/cbrt'], function (exports, _cbrt) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _cbrt.default;
    }
  });
  Object.defineProperty(exports, 'cbrt', {
    enumerable: true,
    get: function () {
      return _cbrt.cbrt;
    }
  });
});
;define('ember-share-db/helpers/ceil', ['exports', 'ember-math-helpers/helpers/ceil'], function (exports, _ceil) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _ceil.default;
    }
  });
  Object.defineProperty(exports, 'ceil', {
    enumerable: true,
    get: function () {
      return _ceil.ceil;
    }
  });
});
;define('ember-share-db/helpers/clz32', ['exports', 'ember-math-helpers/helpers/clz32'], function (exports, _clz) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _clz.default;
    }
  });
  Object.defineProperty(exports, 'clz32', {
    enumerable: true,
    get: function () {
      return _clz.clz32;
    }
  });
});
;define('ember-share-db/helpers/cos', ['exports', 'ember-math-helpers/helpers/cos'], function (exports, _cos) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _cos.default;
    }
  });
  Object.defineProperty(exports, 'cos', {
    enumerable: true,
    get: function () {
      return _cos.cos;
    }
  });
});
;define('ember-share-db/helpers/cosh', ['exports', 'ember-math-helpers/helpers/cosh'], function (exports, _cosh) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _cosh.default;
    }
  });
  Object.defineProperty(exports, 'cosh', {
    enumerable: true,
    get: function () {
      return _cosh.cosh;
    }
  });
});
;define('ember-share-db/helpers/div', ['exports', 'ember-math-helpers/helpers/div'], function (exports, _div) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _div.default;
    }
  });
  Object.defineProperty(exports, 'div', {
    enumerable: true,
    get: function () {
      return _div.div;
    }
  });
});
;define('ember-share-db/helpers/exp', ['exports', 'ember-math-helpers/helpers/exp'], function (exports, _exp) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _exp.default;
    }
  });
  Object.defineProperty(exports, 'exp', {
    enumerable: true,
    get: function () {
      return _exp.exp;
    }
  });
});
;define('ember-share-db/helpers/expm1', ['exports', 'ember-math-helpers/helpers/expm1'], function (exports, _expm) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _expm.default;
    }
  });
  Object.defineProperty(exports, 'expm1', {
    enumerable: true,
    get: function () {
      return _expm.expm1;
    }
  });
});
;define('ember-share-db/helpers/floor', ['exports', 'ember-math-helpers/helpers/floor'], function (exports, _floor) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _floor.default;
    }
  });
  Object.defineProperty(exports, 'floor', {
    enumerable: true,
    get: function () {
      return _floor.floor;
    }
  });
});
;define('ember-share-db/helpers/fround', ['exports', 'ember-math-helpers/helpers/fround'], function (exports, _fround) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _fround.default;
    }
  });
  Object.defineProperty(exports, 'fround', {
    enumerable: true,
    get: function () {
      return _fround.fround;
    }
  });
});
;define('ember-share-db/helpers/gcd', ['exports', 'ember-math-helpers/helpers/gcd'], function (exports, _gcd) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _gcd.default;
    }
  });
  Object.defineProperty(exports, 'gcd', {
    enumerable: true,
    get: function () {
      return _gcd.gcd;
    }
  });
});
;define('ember-share-db/helpers/hypot', ['exports', 'ember-math-helpers/helpers/hypot'], function (exports, _hypot) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _hypot.default;
    }
  });
  Object.defineProperty(exports, 'hypot', {
    enumerable: true,
    get: function () {
      return _hypot.hypot;
    }
  });
});
;define('ember-share-db/helpers/imul', ['exports', 'ember-math-helpers/helpers/imul'], function (exports, _imul) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _imul.default;
    }
  });
  Object.defineProperty(exports, 'imul', {
    enumerable: true,
    get: function () {
      return _imul.imul;
    }
  });
});
;define('ember-share-db/helpers/in-list', ['exports', 'ember-railio-grid/helpers/in-list'], function (exports, _inList) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _inList.default;
    }
  });
  Object.defineProperty(exports, 'inList', {
    enumerable: true,
    get: function () {
      return _inList.inList;
    }
  });
});
;define('ember-share-db/helpers/is-equal', ['exports', 'ember-railio-grid/helpers/is-equal'], function (exports, _isEqual) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _isEqual.default;
    }
  });
});
;define('ember-share-db/helpers/lcm', ['exports', 'ember-math-helpers/helpers/lcm'], function (exports, _lcm) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _lcm.default;
    }
  });
  Object.defineProperty(exports, 'lcm', {
    enumerable: true,
    get: function () {
      return _lcm.lcm;
    }
  });
});
;define('ember-share-db/helpers/log-e', ['exports', 'ember-math-helpers/helpers/log-e'], function (exports, _logE) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _logE.default;
    }
  });
  Object.defineProperty(exports, 'logE', {
    enumerable: true,
    get: function () {
      return _logE.logE;
    }
  });
});
;define('ember-share-db/helpers/log10', ['exports', 'ember-math-helpers/helpers/log10'], function (exports, _log) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _log.default;
    }
  });
  Object.defineProperty(exports, 'log10', {
    enumerable: true,
    get: function () {
      return _log.log10;
    }
  });
});
;define('ember-share-db/helpers/log1p', ['exports', 'ember-math-helpers/helpers/log1p'], function (exports, _log1p) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _log1p.default;
    }
  });
  Object.defineProperty(exports, 'log1p', {
    enumerable: true,
    get: function () {
      return _log1p.log1p;
    }
  });
});
;define('ember-share-db/helpers/log2', ['exports', 'ember-math-helpers/helpers/log2'], function (exports, _log) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _log.default;
    }
  });
  Object.defineProperty(exports, 'log2', {
    enumerable: true,
    get: function () {
      return _log.log2;
    }
  });
});
;define('ember-share-db/helpers/max', ['exports', 'ember-math-helpers/helpers/max'], function (exports, _max) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _max.default;
    }
  });
  Object.defineProperty(exports, 'max', {
    enumerable: true,
    get: function () {
      return _max.max;
    }
  });
});
;define('ember-share-db/helpers/min', ['exports', 'ember-math-helpers/helpers/min'], function (exports, _min) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _min.default;
    }
  });
  Object.defineProperty(exports, 'min', {
    enumerable: true,
    get: function () {
      return _min.min;
    }
  });
});
;define('ember-share-db/helpers/mod', ['exports', 'ember-math-helpers/helpers/mod'], function (exports, _mod) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _mod.default;
    }
  });
  Object.defineProperty(exports, 'mod', {
    enumerable: true,
    get: function () {
      return _mod.mod;
    }
  });
});
;define('ember-share-db/helpers/mult', ['exports', 'ember-math-helpers/helpers/mult'], function (exports, _mult) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _mult.default;
    }
  });
  Object.defineProperty(exports, 'mult', {
    enumerable: true,
    get: function () {
      return _mult.mult;
    }
  });
});
;define('ember-share-db/helpers/on-document', ['exports', 'ember-on-helper/helpers/on-document'], function (exports, _onDocument) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _onDocument.default;
    }
  });
});
;define('ember-share-db/helpers/on-window', ['exports', 'ember-on-helper/helpers/on-window'], function (exports, _onWindow) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _onWindow.default;
    }
  });
});
;define('ember-share-db/helpers/on', ['exports', 'ember-on-helper/helpers/on'], function (exports, _on) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _on.default;
    }
  });
});
;define('ember-share-db/helpers/perform', ['exports', 'ember-concurrency/helpers/perform'], function (exports, _perform) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _perform.default;
    }
  });
});
;define('ember-share-db/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, _pluralize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _pluralize.default;
});
;define('ember-share-db/helpers/pow', ['exports', 'ember-math-helpers/helpers/pow'], function (exports, _pow) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _pow.default;
    }
  });
  Object.defineProperty(exports, 'pow', {
    enumerable: true,
    get: function () {
      return _pow.pow;
    }
  });
});
;define('ember-share-db/helpers/random', ['exports', 'ember-math-helpers/helpers/random'], function (exports, _random) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _random.default;
    }
  });
  Object.defineProperty(exports, 'random', {
    enumerable: true,
    get: function () {
      return _random.random;
    }
  });
});
;define('ember-share-db/helpers/round', ['exports', 'ember-math-helpers/helpers/round'], function (exports, _round) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _round.default;
    }
  });
  Object.defineProperty(exports, 'round', {
    enumerable: true,
    get: function () {
      return _round.round;
    }
  });
});
;define('ember-share-db/helpers/route-action', ['exports', 'ember-route-action-helper/helpers/route-action'], function (exports, _routeAction) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _routeAction.default;
    }
  });
});
;define('ember-share-db/helpers/sign', ['exports', 'ember-math-helpers/helpers/sign'], function (exports, _sign) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _sign.default;
    }
  });
  Object.defineProperty(exports, 'sign', {
    enumerable: true,
    get: function () {
      return _sign.sign;
    }
  });
});
;define('ember-share-db/helpers/sin', ['exports', 'ember-math-helpers/helpers/sin'], function (exports, _sin) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _sin.default;
    }
  });
  Object.defineProperty(exports, 'sin', {
    enumerable: true,
    get: function () {
      return _sin.sin;
    }
  });
});
;define('ember-share-db/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, _singularize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _singularize.default;
});
;define('ember-share-db/helpers/sqrt', ['exports', 'ember-math-helpers/helpers/sqrt'], function (exports, _sqrt) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _sqrt.default;
    }
  });
  Object.defineProperty(exports, 'sqrt', {
    enumerable: true,
    get: function () {
      return _sqrt.sqrt;
    }
  });
});
;define('ember-share-db/helpers/sub', ['exports', 'ember-math-helpers/helpers/sub'], function (exports, _sub) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _sub.default;
    }
  });
  Object.defineProperty(exports, 'sub', {
    enumerable: true,
    get: function () {
      return _sub.sub;
    }
  });
});
;define('ember-share-db/helpers/tan', ['exports', 'ember-math-helpers/helpers/tan'], function (exports, _tan) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _tan.default;
    }
  });
  Object.defineProperty(exports, 'tan', {
    enumerable: true,
    get: function () {
      return _tan.tan;
    }
  });
});
;define('ember-share-db/helpers/tanh', ['exports', 'ember-math-helpers/helpers/tanh'], function (exports, _tanh) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _tanh.default;
    }
  });
  Object.defineProperty(exports, 'tanh', {
    enumerable: true,
    get: function () {
      return _tanh.tanh;
    }
  });
});
;define('ember-share-db/helpers/task', ['exports', 'ember-concurrency/helpers/task'], function (exports, _task) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _task.default;
    }
  });
});
;define('ember-share-db/helpers/trunc', ['exports', 'ember-math-helpers/helpers/trunc'], function (exports, _trunc) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _trunc.default;
    }
  });
  Object.defineProperty(exports, 'trunc', {
    enumerable: true,
    get: function () {
      return _trunc.trunc;
    }
  });
});
;define('ember-share-db/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'ember-share-db/config/environment'], function (exports, _initializerFactory, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  let name, version;
  if (_environment.default.APP) {
    name = _environment.default.APP.name;
    version = _environment.default.APP.version;
  }

  exports.default = {
    name: 'App Version',
    initialize: (0, _initializerFactory.default)(name, version)
  };
});
;define('ember-share-db/initializers/container-debug-adapter', ['exports', 'ember-resolver/resolvers/classic/container-debug-adapter'], function (exports, _containerDebugAdapter) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'container-debug-adapter',

    initialize() {
      let app = arguments[1] || arguments[0];

      app.register('container-debug-adapter:main', _containerDebugAdapter.default);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
});
;define('ember-share-db/initializers/ember-concurrency', ['exports', 'ember-concurrency/initializers/ember-concurrency'], function (exports, _emberConcurrency) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _emberConcurrency.default;
    }
  });
});
;define('ember-share-db/initializers/ember-data', ['exports', 'ember-data/setup-container', 'ember-data'], function (exports, _setupContainer) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'ember-data',
    initialize: _setupContainer.default
  };
});
;define('ember-share-db/initializers/ember-simple-auth', ['exports', 'ember-share-db/config/environment', 'ember-simple-auth/configuration', 'ember-simple-auth/initializers/setup-session', 'ember-simple-auth/initializers/setup-session-service', 'ember-simple-auth/initializers/setup-session-restoration'], function (exports, _environment, _configuration, _setupSession, _setupSessionService, _setupSessionRestoration) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'ember-simple-auth',

    initialize(registry) {
      const config = _environment.default['ember-simple-auth'] || {};
      config.rootURL = _environment.default.rootURL || _environment.default.baseURL;
      _configuration.default.load(config);

      (0, _setupSession.default)(registry);
      (0, _setupSessionService.default)(registry);
      (0, _setupSessionRestoration.default)(registry);
    }
  };
});
;define('ember-share-db/initializers/export-application-global', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.initialize = initialize;
  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_environment.default.exportApplicationGlobal !== false) {
      var theGlobal;
      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _environment.default.exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = Ember.String.classify(_environment.default.modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;

        application.reopen({
          willDestroy: function () {
            this._super.apply(this, arguments);
            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  exports.default = {
    name: 'export-application-global',

    initialize: initialize
  };
});
;define('ember-share-db/initializers/load-bootstrap-config', ['exports', 'ember-share-db/config/environment', 'ember-bootstrap/config'], function (exports, _environment, _config) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.initialize = initialize;
  function initialize() /* container, application */{
    _config.default.load(_environment.default['ember-bootstrap'] || {});
  }

  exports.default = {
    name: 'load-bootstrap-config',
    initialize
  };
});
;define('ember-share-db/initializers/resize', ['exports', 'ember-resize/services/resize', 'ember-share-db/config/environment'], function (exports, _resize, _environment) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.initialize = initialize;
    function initialize(application) {
        const resizeServiceDefaults = Ember.getWithDefault(_environment.default, 'resizeServiceDefaults', {
            debounceTimeout: 200,
            heightSensitive: true,
            widthSensitive: true
        });
        const injectionFactories = Ember.getWithDefault(resizeServiceDefaults, 'injectionFactories', ['view', 'component']) || [];
        application.unregister('config:resize-service');
        application.register('config:resize-service', resizeServiceDefaults, { instantiate: false });
        application.register('service:resize', _resize.default);
        const resizeService = application.resolveRegistration('service:resize');
        resizeService.prototype.resizeServiceDefaults = resizeServiceDefaults;
        injectionFactories.forEach(factory => {
            application.inject(factory, 'resizeService', 'service:resize');
        });
    }
    exports.default = {
        initialize,
        name: 'resize'
    };
});
;define('ember-share-db/instance-initializers/ember-data', ['exports', 'ember-data/initialize-store-service'], function (exports, _initializeStoreService) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'ember-data',
    initialize: _initializeStoreService.default
  };
});
;define('ember-share-db/instance-initializers/ember-simple-auth', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'ember-simple-auth',

    initialize() {}
  };
});
;define('ember-share-db/instance-initializers/patch-bootstrap-modals-manager', ['exports', 'ember-bootstrap-modals-manager/instance-initializers/patch-bootstrap-modals-manager'], function (exports, _patchBootstrapModalsManager) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _patchBootstrapModalsManager.default;
    }
  });
  Object.defineProperty(exports, 'initialize', {
    enumerable: true,
    get: function () {
      return _patchBootstrapModalsManager.initialize;
    }
  });
});
;define('ember-share-db/instance-initializers/session-events', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.initialize = initialize;
  function initialize(instance) {
    const applicationRoute = instance.lookup('route:application');
    const session = instance.lookup('service:session');
    session.on('authenticationSucceeded', function () {
      console.log('authenticationSucceeded callback');
      applicationRoute.transitionTo('application');
    });
    session.on('invalidationSucceeded', function () {
      console.log('invalidationSucceeded callback');
      applicationRoute.transitionTo('application');
    });
  }

  exports.default = {
    initialize,
    name: 'session-events',
    after: 'ember-simple-auth'
  };
});
;define('ember-share-db/mixins/resize-aware', ['exports', 'ember-resize/mixins/resize-aware'], function (exports, _resizeAware) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _resizeAware.default;
    }
  });
});
;define('ember-share-db/models/account', ['exports', 'ember-data'], function (exports, _emberData) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  const { attr, Model } = _emberData.default;

  exports.default = Model.extend({
    username: attr('string'),
    password: attr('string'),
    email: attr('string'),
    created: attr('date'),
    accountId: attr('string')
  });
});
;define('ember-share-db/models/asset', ['exports', 'ember-data'], function (exports, _emberData) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  const { attr } = _emberData.default;

  exports.default = _emberData.default.Model.extend({
    fileType: attr('string'),
    fileId: attr('string'),
    size: attr('string'),
    b64data: attr('string'),
    name: attr('string')
  });
});
;define('ember-share-db/models/document', ['exports', 'ember-data'], function (exports, _emberData) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberData.default.Model.extend({
    source: _emberData.default.attr('string'),
    owner: _emberData.default.attr('string'),
    ownerId: _emberData.default.attr('string'),
    name: _emberData.default.attr('string'),
    created: _emberData.default.attr('date'),
    isPrivate: _emberData.default.attr('boolean'),
    readOnly: _emberData.default.attr('boolean'),
    documentId: _emberData.default.attr('string'),
    lastEdited: _emberData.default.attr('date'),
    assets: _emberData.default.attr(),
    tags: _emberData.default.attr(),
    forkedFrom: _emberData.default.attr('string'),
    savedVals: _emberData.default.attr(),
    newEval: _emberData.default.attr(),
    stats: _emberData.default.attr(),
    flags: _emberData.default.attr('number'),
    assetQuota: _emberData.default.attr('number'),
    dontPlay: _emberData.default.attr('boolean'),
    isCollaborative: _emberData.default.attr('boolean'),
    children: _emberData.default.attr(),
    collaborators: _emberData.default.attr(),
    parent: _emberData.default.attr('string'),
    type: _emberData.default.attr('string')
  });
});
;define('ember-share-db/modifiers/focus-trap', ['exports', 'ember-focus-trap/modifiers/focus-trap'], function (exports, _focusTrap) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _focusTrap.default;
    }
  });
});
;define('ember-share-db/modifiers/ref', ['exports', 'ember-ref-modifier/modifiers/ref'], function (exports, _ref) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _ref.default;
    }
  });
});
;define('ember-share-db/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberResolver.default;
});
;define('ember-share-db/router', ['exports', 'ember-share-db/config/environment', 'ember-tracker/mixins/google-analytics-route'], function (exports, _environment, _googleAnalyticsRoute) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  const Router = Ember.Router.extend(_googleAnalyticsRoute.default, {
    location: _environment.default.locationType,
    rootURL: _environment.default.rootURL
  });

  Router.map(function () {
    this.route('login');
    this.route('code-editor', { path: '/code/:document_id' });
    this.route('documents', { path: '/d/:search/:page/:sort' });
    this.route('password-reset');
    this.route('about');
    this.route('terms');
    this.route('getting-started', { path: '/getting-started/:topic' });
    this.route('guides', { path: '/guides/:topic' });
    this.route('examples', { path: '/examples/:topic' });
    this.route('api', { path: '/api/*endpoint' });
    this.route('inputs');
    this.route('outputs');
    this.route('people');
    this.route('nime2020');
    this.route('futurelearn');
    this.route('crash-course');
    this.route('techyard');
  });

  exports.default = Router;
});
;define('ember-share-db/routes/about', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({
    setupController: function (controller, model) {
      this._super(controller, model);
      controller.send('refresh');
    }
  });
});
;define('ember-share-db/routes/api', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({
    endpoint: '',
    model: function (params) {
      this.set('endpoint', params.endpoint);
      return params.endpoint;
    },
    redirect: function () {
      window.location = _environment.default.serverHost + "/" + this.get('endpoint');
    }
  });
});
;define('ember-share-db/routes/application', ['exports', 'ember-simple-auth/mixins/application-route-mixin'], function (exports, _applicationRouteMixin) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend(_applicationRouteMixin.default, {
    activate() {
      this.get('cs').log('entering application route');
    },
    cs: Ember.inject.service('console'),
    sessionAccount: Ember.inject.service('session-account'),
    session: Ember.inject.service('session'),
    async beforeModel() {
      this.get('cs').log('beforeModel application route');
      await this._loadCurrentUser();
      this.get('cs').log('ending beforeModel application route');
    },
    sessionAuthenticated() {
      this._super(...arguments);
      this.get('cs').log("session authenticated");
      this._loadCurrentUser();
    },
    _loadCurrentUser() {
      return new Ember.RSVP.Promise((resolve, reject) => {
        this.get('cs').log('loading current user');
        this.get('sessionAccount').loadCurrentUser().then(() => {
          this.get('sessionAccount').getUserFromName().then(() => {
            this.get('sessionAccount').updateOwnedDocuments().then(resolve()).catch(() => {
              this.get('cs').log('no current user');
              this.get('session').invalidate();
              resolve();
            });
          }).catch(() => {
            this.get('cs').log('no current user');
            this.get('session').invalidate();
            resolve();
          });;
        }).catch(() => {
          this.get('cs').log('no current user');
          this.get('session').invalidate();
          resolve();
        });
      });
    }
  });
});
;define('ember-share-db/routes/code-editor', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({
    cs: Ember.inject.service('console'),
    queryParams: {
      showCode: {
        replace: true
      },
      embed: {
        replace: true
      }
    },
    model: function (params) {
      return this.get('store').findRecord('document', params.document_id);
    },
    setupController: function (controller, model) {
      this._super(controller, model);
      if (model) {
        controller.send('refresh');
      }
    },
    deactivate: function () {
      this.get('cs').log("leaving code-editor");
      this._super();
      this.get('controller').send('cleanUp');
    },
    actions: {
      error(error, transition) {
        if (error.errors[0].status === '404') {
          this.replaceWith('application');
        } else {
          return true;
        }
      }
    }
  });
});
;define('ember-share-db/routes/crash-course', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({});
});
;define('ember-share-db/routes/documents', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({
    sessionAccount: Ember.inject.service("session-account"),
    cs: Ember.inject.service('console'),
    setupController: function (controller, model) {
      this._super(controller, model);
      if (controller) {
        this.get('cs').log("setupController document", model.docs.query.filter.sortBy);
        controller.send('updateSelectedFilter', model.docs.query.filter.sortBy);
        controller.send('flashResults');
      }
    },
    model(params) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        let currentUserId = this.get('sessionAccount').currentUserId;
        let currentUserName = this.get('sessionAccount').currentUserName;
        this.get('cs').log("document model", currentUserId, currentUserName, params.sort);
        const sort = params.sort ? params.sort : "views";
        const search = params.search ? params.search : " ";
        let filter = {
          filter: {
            search: search,
            page: params.page,
            currentUser: currentUserId,
            sortBy: sort
          }
        };
        if (Ember.isEmpty(currentUserId)) {
          if (!Ember.isEmpty(currentUserName)) {
            this.get('cs').log("has name but doesnt have currentUserId", currentUserName);
            this.get('sessionAccount').getUserFromName().then(() => {
              this.get('sessionAccount').updateOwnedDocuments().then(() => {
                filter.filter.currentUser = this.get('sessionAccount').currentUserId;
                this.get('cs').log("document model got id", filter.filter.currentUser);
                this.get('store').query('document', filter).then(res => {
                  resolve({ docs: res, filter: filter.filter });
                });
              }).catch(err => {
                this.get('cs').log('updateOwnedDocuments', err);
              });
            }).catch(err => {
              this.get('cs').log('error getUserFromName', err);
              filter.filter.currentUser = "";
              this.get('store').query('document', filter).then(res => {
                resolve({ docs: res, filter: filter.filter });
              }).catch(err => {
                this.get('cs').log('error query', err);
                reject(err);
              });
            });
          } else {
            this.get('sessionAccount').updateOwnedDocuments().then(() => {
              this.get('store').query('document', filter).then(res => {
                resolve({ docs: res, filter: filter.filter });
              }).catch(err => reject(err));
            }).catch(err => reject(err));
          }
        } else if (!Ember.isEmpty(currentUserName)) {
          this.get('store').query('document', filter).then(res => {
            resolve({ docs: res, filter: filter.filter });
          }).catch(err => reject(err));
        } else {
          filter.filter.currentUser = "";
          this.get('store').query('document', filter).then(res => {
            this.get('cs').log("c");
            resolve({ docs: res, filter: filter.filter });
          });
        }
      }).catch(err => reject(err));;
    },
    actions: {
      error(error, transition) {
        this.get('cs').log("ERROR transitioning document route", error);
        const err = error.errors ? error.errors : error;
        if (error) {
          if (err.status === '404') {
            this.get('cs').log("ERROR 404");
            this.replaceWith('application');
          } else {
            return true;
          }
        }
      }
    }
  });
});
;define('ember-share-db/routes/examples', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({
    examples: Ember.inject.service(),
    cs: Ember.inject.service('console'),
    model(params) {
      const examples = this.get('examples').examples;
      this.get('cs').log(examples, params);
      for (let i = 0; i < examples.length; i++) {
        let group = examples[i];
        for (let j = 0; j < group.examples.length; j++) {
          let example = group.examples[j];
          if (example.id == params.topic) {
            this.get('cs').log("EARLY RETURNING");
            return example;
          }
        }
      }
      return examples;
    }
  });
});
;define('ember-share-db/routes/futurelearn', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({});
});
;define('ember-share-db/routes/getting-started', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({
    model(params) {
      return params.topic;
    }
  });
});
;define('ember-share-db/routes/guides', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({
    guides: Ember.inject.service(),
    cs: Ember.inject.service('console'),
    model(params) {
      const guides = this.get('guides').guides;
      this.get('cs').log(guides, params);
      for (let i = 0; i < guides.length; i++) {
        let group = guides[i];
        for (let j = 0; j < group.guides.length; j++) {
          let guide = group.guides[j];
          this.get('cs').log(guide.id == params.topic, guide.id, params.topic);
          if (guide.id == params.topic) {
            this.get('cs').log("EARLY RETURNIGN");
            return guide;
          }
        }
      }
      return guides;
    }
  });
});
;define('ember-share-db/routes/index', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({
    beforeModel() {
      this.transitionTo('about');
    }
  });
});
;define('ember-share-db/routes/inputs', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({});
});
;define('ember-share-db/routes/login', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend();
});
;define('ember-share-db/routes/nime2020', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({});
});
;define('ember-share-db/routes/outputs', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({});
});
;define('ember-share-db/routes/password-reset', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({
    setupController: function (controller, model) {
      controller.isTokenValid();
    }
  });
});
;define('ember-share-db/routes/people', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({});
});
;define('ember-share-db/routes/techyard', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({});
});
;define('ember-share-db/routes/terms', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({});
});
;define('ember-share-db/serializers/document', ['exports', 'ember-data'], function (exports, _emberData) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberData.default.JSONAPISerializer.extend({
    keyForAttribute(attr) {
      if (attr == 'document-Id') return 'documentId';else {
        return attr;
      }
    }
  });
});
;define('ember-share-db/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _ajax) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _ajax.default;
    }
  });
});
;define('ember-share-db/services/assets', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Service.extend({
    sessionAccount: Ember.inject.service('session-account'),
    store: Ember.inject.service('store'),
    cs: Ember.inject.service('console'),
    deleteAsset(fileName, doc = this.get('sessionAccount').currentDoc) {
      this.get('cs').log("deleteAsset for " + fileName);
      return new Ember.RSVP.Promise((resolve, reject) => {
        $.ajax({
          type: "DELETE",
          url: _environment.default.serverHost + "/asset/" + doc + "/" + fileName,
          headers: { 'Authorization': 'Bearer ' + this.get('sessionAccount.bearerToken') }
        }).then(Ember.run.bind(res => {
          this.get('cs').log("success deleting asset");
          resolve();
        })).catch(Ember.run.bind(err => {
          this.get('cs').log("error", err);
          reject(err);
        }));
      });
    },
    isMedia: function (fileType) {
      return fileType.includes("audio") || fileType.includes("image") || fileType.includes("video");
    },
    //Dont base64 big files
    isTooBig: function (fileSize) {
      return fileSize > 1800000;
    },
    fetchAsset: async function (asset, docId) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        const fileId = asset.fileId;
        const fileName = asset.name;
        const fileType = asset.fileType;
        const inStoreAsset = this.get('store').peekRecord('asset', fileId);
        this.get('cs').log("asset", asset);
        if (!Ember.isEmpty(inStoreAsset) && !Ember.isEmpty(inStoreAsset.b64data)) {
          this.get('cs').log("asset already preloaded:" + fileId);
          resolve();
          return;
        }
        var xhr = new XMLHttpRequest();
        var url = _environment.default.serverHost + "/asset/" + docId + "/" + fileName;
        this.get('cs').log("fetching asset: " + asset + " from " + url);
        xhr.onload = () => {
          this.get('cs').log(xhr.readyState, xhr.status == 200);
          if (xhr.readyState == 4 && xhr.status == 200) {
            this.get('cs').log("fetched asset:" + fileId);
            this.get('store').push({
              data: [{
                id: fileId,
                type: "asset",
                attributes: {
                  size: asset.size,
                  fileId: fileId,
                  name: fileName,
                  b64data: this._b64e(xhr.responseText),
                  fileType: fileType
                }
              }]
            });
            resolve();
          }
        };
        xhr.onerror = () => {
          this.get('cs').log("error fetching/converting asset:" + fileId);
          reject("error fetching/converting asset:" + fileId);
        };
        xhr.overrideMimeType("text/plain; charset=x-user-defined");
        xhr.open("GET", url, true);
        xhr.send(null);
      });
    },
    preloadAssets(assets, docId) {
      this.get('cs').log("preloadAssets:" + assets);
      return new Ember.RSVP.Promise((resolve, reject) => {
        const getAllASync = async c => {
          for (const a of assets) {
            if (this.isMedia(a.fileType)) {
              await this.fetchAsset(a, docId).catch(err => {
                this.get('cs').log("ERROR IN FETCHING ASSET");
                reject(err);
                return;
              });
            }
          }
          resolve();
        };
        getAllASync();
      });
    },
    _b64e(str) {
      this.get('cs').log("converting to base64");
      // from this SO question
      // http://stackoverflow.com/questions/7370943/retrieving-binary-file-content-using-javascript-base64-encode-it-and-reverse-de
      let CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      let out = "",
          i = 0,
          len = str.length,
          c1,
          c2,
          c3;
      while (i < len) {
        c1 = str.charCodeAt(i++) & 0xff;
        if (i == len) {
          out += CHARS.charAt(c1 >> 2);
          out += CHARS.charAt((c1 & 0x3) << 4);
          out += "==";
          break;
        }
        c2 = str.charCodeAt(i++);
        if (i == len) {
          out += CHARS.charAt(c1 >> 2);
          out += CHARS.charAt((c1 & 0x3) << 4 | (c2 & 0xF0) >> 4);
          out += CHARS.charAt((c2 & 0xF) << 2);
          out += "=";
          break;
        }
        c3 = str.charCodeAt(i++);
        out += CHARS.charAt(c1 >> 2);
        out += CHARS.charAt((c1 & 0x3) << 4 | (c2 & 0xF0) >> 4);
        out += CHARS.charAt((c2 & 0xF) << 2 | (c3 & 0xC0) >> 6);
        out += CHARS.charAt(c3 & 0x3F);
      }
      this.get('cs').log("converted to b64e");
      return out;
    }
  });
});
;define('ember-share-db/services/autocomplete', ['exports', 'codemirror'], function (exports, _codemirror) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Service.extend({
    cs: Ember.inject.service('console'),
    tabs: children => {
      return children.map(child => {
        return child.data.name;
      });
    },
    assets: assets => {
      return assets.map(asset => {
        return asset.name;
      });
    },
    stringProps: ("charAt charCodeAt indexOf lastIndexOf substring substr slice trim trimLeft trimRight " + "toUpperCase toLowerCase split concat match replace search").split(" "),
    arrayProps: ("length concat join splice push pop shift unshift slice reverse sort indexOf " + "lastIndexOf every some filter forEach map reduce reduceRight ").split(" "),
    funcProps: "prototype apply call bind".split(" "),
    javascriptKeywords: ("break case catch class const continue debugger default delete do else export extends false finally for function " + "if in import instanceof new null return super switch this throw true try typeof var void while with yield").split(" "),
    forEach(arr, f) {
      for (var i = 0, e = arr.length; i < e; ++i) f(arr[i]);
    },
    arrayContains(arr, item) {
      if (!Array.prototype.indexOf) {
        var i = arr.length;
        while (i--) {
          if (arr[i] === item) {
            return true;
          }
        }
        return false;
      }
      return arr.indexOf(item) != -1;
    },
    forAllProps(obj, callback) {
      if (!Object.getOwnPropertyNames || !Object.getPrototypeOf) {
        for (var name in obj) callback(name);
      } else {
        for (var o = obj; o; o = Object.getPrototypeOf(o)) Object.getOwnPropertyNames(o).forEach(callback);
      }
    },
    getCompletions(token, context, keywords, options) {
      var found = [],
          start = token.string,
          global = options && options.globalScope || window;
      let maybeAdd = str => {
        if (str.lastIndexOf(start, 0) == 0 && !this.arrayContains(found, str)) found.push(str);
      };
      let gatherCompletions = obj => {
        if (typeof obj == "string") this.forEach(this.get('stringProps'), maybeAdd);else if (obj instanceof Array) this.forEach(this.get('arrayProps'), maybeAdd);else if (obj instanceof Function) this.forEach(this.get('funcProps'), maybeAdd);
        this.forAllProps(obj, maybeAdd);
      };

      if (context && context.length) {
        // If this is a property, see if it belongs to some object we can
        // find in the current environment.
        var obj = context.pop(),
            base;
        if (obj.type && obj.type.indexOf("variable") === 0) {
          if (options && options.additionalContext) base = options.additionalContext[obj.string];
          if (!options || options.useGlobalScope !== false) base = base || global[obj.string];
        } else if (obj.type == "string") {
          base = "";
        } else if (obj.type == "atom") {
          base = 1;
        } else if (obj.type == "function") {
          if (global.jQuery != null && (obj.string == '$' || obj.string == 'jQuery') && typeof global.jQuery == 'function') base = global.jQuery();else if (global._ != null && obj.string == '_' && typeof global._ == 'function') base = global._();
        }
        while (base != null && context.length) base = base[context.pop().string];
        if (base != null) gatherCompletions(base);
      } else {
        // If not, just look in the global object and any local scope
        // (reading into JS mode internals to get at the local and global variables)
        for (var v = token.state.localVars; v; v = v.next) maybeAdd(v.name);
        for (var v = token.state.globalVars; v; v = v.next) maybeAdd(v.name);
        if (!options || options.useGlobalScope !== false) gatherCompletions(global);
        this.forEach(keywords, maybeAdd);
      }
      return found;
    },
    jsScriptHint(editor, keywords, getToken, options) {
      // Find the token at the cursor
      var cur = editor.getCursor(),
          token = getToken(editor, cur);
      if (/\b(?:string|comment)\b/.test(token.type)) return;
      var innerMode = _codemirror.default.innerMode(editor.getMode(), token.state);
      if (innerMode.mode.helperType === "json") return;
      token.state = innerMode.state;

      // If it's not a 'word-style' token, ignore the token.
      if (!/^[\w$_]*$/.test(token.string)) {
        token = { start: cur.ch, end: cur.ch, string: "", state: token.state,
          type: token.string == "." ? "property" : null };
      } else if (token.end > cur.ch) {
        token.end = cur.ch;
        token.string = token.string.slice(0, cur.ch - token.start);
      }

      var tprop = token;
      // If it is a property, find out what it is a property of.
      while (tprop.type == "property") {
        tprop = getToken(editor, _codemirror.default.Pos(cur.line, tprop.start));
        if (tprop.string != ".") return;
        tprop = getToken(editor, _codemirror.default.Pos(cur.line, tprop.start));
        if (!context) var context = [];
        context.push(tprop);
      }
      return { list: this.getCompletions(token, context, keywords, options),
        from: _codemirror.default.Pos(cur.line, token.start),
        to: _codemirror.default.Pos(cur.line, token.end) };
    },
    toFind(editor, options, targets) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          let cursor = editor.getCursor(),
              line = editor.getLine(cursor.line);
          let start = cursor.ch,
              end = cursor.ch;
          let from, to;
          let matches = [];
          while (start && /\w/.test(line.charAt(start - 1))) --start;
          while (end < line.length && /\w/.test(line.charAt(end))) ++end;
          var word = line.slice(start, end).toLowerCase();
          if (word.length > 1) {
            for (var i = 0; i < targets.length; i++) {
              if (targets[i].toLowerCase().indexOf(word) !== -1) {
                matches.push(targets[i]);
                from = _codemirror.default.Pos(cursor.line, start);
                to = _codemirror.default.Pos(cursor.line, end);
              }
            }
          }
          if (word.length > 0) {
            const js = this.jsScriptHint(editor, this.get('javascriptKeywords'), (e, cur) => {
              return e.getTokenAt(cur);
            }, options);
            if (!Ember.isEmpty(js)) {
              to = js.to;
              from = js.from;
              matches = matches.concat(js.list);
            }
          }
          resolve({ list: matches, from: from, to: to });
        }, 100);
      });
    },
    ruleSets(docType) {
      //this.get('cs').log("getting rule set for" ,docType);
      let ruleSets = {
        "tagname-lowercase": true,
        "attr-lowercase": true,
        "attr-value-double-quotes": false,
        "tag-pair": true,
        "spec-char-escape": true,
        "id-unique": true,
        "src-not-empty": true,
        "attr-no-duplication": true,
        "csslint": {
          "display-property-grouping": true,
          "known-properties": true
        },
        "jshint": { "esversion": 6, "asi": true }
      };
      if (docType == "javascript") {
        ruleSets = {
          "tagname-lowercase": false,
          "attr-lowercase": false,
          "attr-value-double-quotes": false,
          "tag-pair": false,
          "spec-char-escape": false,
          "id-unique": false,
          "src-not-empty": false,
          "attr-no-duplication": false,
          "csslint": {
            "display-property-grouping": false,
            "known-properties": false
          },
          "jshint": { "esversion": 6, "asi": true }
        };
      }
      return ruleSets;
    }
  });
});
;define('ember-share-db/services/code-parsing', ['exports', 'acorn', 'acorn/dist/walk', 'ember-share-db/config/environment', 'highlight.js'], function (exports, _acorn, _walk, _environment, _highlight) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Service.extend({
    store: Ember.inject.service('store'),
    cs: Ember.inject.service('console'),
    assetService: Ember.inject.service('assets'),
    sessionAccount: Ember.inject.service('session-account'),
    library: Ember.inject.service(),
    script: "",
    savedVals: null,
    hasPVals: false,
    parser: Ember.computed(() => {
      return new DOMParser();
    }),
    insertLibrary(lib, source) {
      let insertAfter = "<head>";
      let index = source.indexOf(insertAfter) + insertAfter.length;
      let insert = "\n <script src = \"" + _environment.default.localOrigin + "/libs/" + this.get('library').url(lib) + "\"></script>";
      const op = { p: ["source", index], si: insert };
      return op;
    },
    insertStyleSheets(source, children) {
      let searchIndex = 0,
          index = 0,
          ptr = 0,
          prevEnd = 0;
      let linkStartIndex = 0,
          tagStartIndex = 0;
      let searchStrs = ["<link", "/>"];
      let preamble = "",
          tag = "";
      let newSrc = "";
      let found = false;
      while ((index = source.indexOf(searchStrs[ptr], searchIndex)) > -1) {
        if (ptr == 0) {
          this.get('cs').log("found start of <link");
          searchIndex = index;
          tagStartIndex = searchIndex;
          preamble = source.substring(prevEnd, searchIndex);
        } else if (ptr == 1) {
          searchIndex = index + searchStrs[ptr].length;
          linkStartIndex = searchIndex;
          tag = source.substring(tagStartIndex, searchIndex);
          found = true;
          this.get('cs').log(tag);
          searchIndex = index + searchStrs[ptr].length;
          newSrc = newSrc + preamble;
          let added = false;
          const parsedTag = this.get('parser').parseFromString(tag, "application/xml");
          const attr = parsedTag.documentElement.attributes;
          let styleSheet = false;
          let media;
          this.get('cs').log("stylesheet", attr);
          for (let i = 0; i < attr.length; i++) {
            if (attr[i].nodeName == "rel" && attr[i].nodeValue == "stylesheet") {
              styleSheet = true;
            } else if (attr[i].nodeName == "media") {
              media = attr[i].nodeValue;
            }
          }
          if (styleSheet) {
            this.get('cs').log("stylesheet", children);
            for (let i = 0; i < attr.length; i++) {
              if (attr[i].nodeName == "href") {
                for (let j = 0; j < children.length; j++) {
                  if (children[j].name == attr[i].nodeValue) {
                    newSrc = newSrc + "<style type = \"text/css\" ";
                    if (media) {
                      newSrc = newSrc + "media = \"" + media + "\"";
                    }
                    newSrc = newSrc + ">\n";
                    newSrc = newSrc + children[j].source;
                    newSrc = newSrc + "\n</style>";
                    added = true;
                    //this.get('cs').log(newSrc);
                    break;
                  }
                }
                break;
              }
            }
          }
          if (!added) {
            newSrc = newSrc + tag;
          }
          prevEnd = searchIndex;
        }
        ptr = (ptr + 1) % searchStrs.length;
      }
      if (found) {
        newSrc = newSrc + source.substr(prevEnd);
      } else {
        newSrc = source;
      }
      return newSrc;
    },
    insertRecording(src, recordingOptions) {
      let newSrc = src;
      if (recordingOptions.isRecording && !Ember.isEmpty(recordingOptions.node.variable)) {
        newSrc = "";
        const top = src.includes("<body>") ? "<body>" : "<head>";
        let topIndex = src.indexOf(top);
        if (topIndex > 0) {
          topIndex += 6;
          newSrc = newSrc + src.substring(0, topIndex);
          newSrc = newSrc + "\n<script src = \"" + _environment.default.localOrigin + "/libs/recorder-wrapper.js\"></script>";
        } else {
          topIndex = 0;
        }
        const end = src.includes("</body>") ? "</body>" : "</head>";
        let endIndex = src.indexOf(end);
        if (endIndex > 0) {
          newSrc = newSrc + src.substring(topIndex, endIndex);
          let node = recordingOptions.node.variable;
          if (recordingOptions.node.library === "maximilian") {
            node = node + ".maxiAudioProcessor";
          } else if (recordingOptions.node.library === "MaxiInstruments") {
            node = node + ".node";
          }
          if (!Ember.isEmpty(node)) {
            newSrc = newSrc + "\n<script language=\"javascript\" type=\"text/javascript\">";
            newSrc = newSrc + "\nconst onRecordLoad = ()=>{initRecorder(" + node + ")}";
            newSrc = newSrc + "\n</script>\n";
          }
          newSrc = newSrc + src.substring(endIndex);
        }
      }
      //this.get('cs').log(newSrc)
      return newSrc;
    },
    insertTabs(src, children, assets) {
      console.log("inserttabs", src);
      let newSrc = "";
      const scripts = this.getScripts(src);
      scripts.forEach(script => {
        newSrc = newSrc + this.insertStyleSheets(script.preamble, children);
        let added = false;
        if (script.src.length == 0) {
          const parsedTag = this.get('parser').parseFromString(script.scriptTag + "</script>", "application/xml");
          const attr = parsedTag.documentElement.attributes;
          for (let i = 0; i < attr.length; i++) {
            //this.get('cs').log(attr[i].nodeName)
            if (attr[i].nodeName == "src") {
              for (let j = 0; j < children.length; j++) {
                //this.get('cs').log(children[j].data.name, attr[i].nodeValue)
                if (children[j].name == attr[i].nodeValue) {
                  newSrc = newSrc + "<script language=\"javascript\" type=\"text/javascript\">\n";
                  newSrc = newSrc + children[j].source;
                  added = true;
                  break;
                }
              }
              break;
            }
          }
        }
        //If not a script imported from a tab
        if (!added) {
          /**
          Insert crossorigin at the beginning of script tags that ARE NOT
          tabs (e.g. actual URLS to externally hosted libraries)
          This is necsesary because all external resources MUST have a CORS
          or CORP policy, and if we dont explictly put in the "crossorigin"
          atrribute, even if the resource has "Access-Control-Allow-Origin:*", it
          doesnt get past.
          */
          this.get("cs").log("not added");
          let scriptTag = script.scriptTag;
          if ((scriptTag.includes("src=") || scriptTag.includes("src =")) && !scriptTag.includes("mimicproject.com")) {
            let toFind = /<script /g;
            let replace = "<script crossorigin ";
            scriptTag = scriptTag.replace(toFind, replace);
          }

          newSrc = newSrc + scriptTag;
          let js = script.src;
          for (let j = 0; j < children.length; j++) {
            const child = children[j];
            const url = _environment.default.redirectServerHost + "/source/" + child.documentId;
            this.get('cs').log("regex for", child.name, child.documentId);
            js = js.replace(new RegExp("\"" + child.name + "\"", "gm"), "\"" + url + "\"");
            js = js.replace(new RegExp("\'" + child.name + "\'", "gm"), "\"" + url + "\"");
            //this.get('cs').log("AFTER", js);
          };
          newSrc = newSrc + js;
        }
        newSrc = newSrc + this.insertStyleSheets(script.post, children);
      });
      if (scripts.length == 0) {
        newSrc = src;
        for (let j = 0; j < children.length; j++) {
          const child = children[j];
          const url = _environment.default.redirectServerHost + "/source/" + child.documentId;
          this.get('cs').log("regex for", child.name, child.documentId);
          newSrc = newSrc.replace(new RegExp("\"" + child.name + "\"", "gm"), "\"" + url + "\"");
          newSrc = newSrc.replace(new RegExp("\'" + child.name + "\'", "gm"), "\"" + url + "\"");
          //this.get('cs').log("AFTER", js);
        };
        newSrc = this.insertStyleSheets(newSrc, children);
      }
      return newSrc;
    },
    insertDatasetId(src, docId) {
      const toFind = /new Learner\(\)/g;
      const replace = "new Learner(\"" + docId + "\")";
      const newSrc = src.replace(toFind, replace);
      return newSrc;
    },
    /**
      We swap out any doc.ac.uk hosted rapidLib libraries for the same-origin
      mimicproject.com hosted one because of CORS
    */
    replaceNoCORSResources(src) {
      //return src
      let toFind,
          replace,
          newSrc = "";
      toFind = /"https:\/\/doc.gold.ac.uk\/eavi\/rapidmix\/RapidLib.js"/g;
      replace = "\"https:\/\/mimicproject.com\/libs\/rapidLib.js\"";
      src = src.replace(toFind, replace);
      toFind = /"https:\/\/www.doc.gold.ac.uk\/eavi\/rapidmix\/RapidLib.js"/g;
      replace = "\"https:\/\/mimicproject.com\/libs\/rapidLib.js\"";
      src = src.replace(toFind, replace);
      return src;
    },
    getPossibleNodes(src) {
      const scripts = this.getScripts(src);
      let possibles = [];
      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        try {
          _walk.default.simple(_acorn.default.parse(script.src), {
            VariableDeclaration: node => {
              node.declarations.forEach(dec => {
                let name = dec.id.name;
                if (!name) {
                  name = script.src.substring(dec.id.start, dec.id.end);
                }
                const init = dec.init;
                let exp = script.src.substring(dec.start, dec.end);
                if (!Ember.isEmpty(init)) {
                  if (init.type === "NewExpression" && exp.includes("maxiAudio(")) {
                    possibles.push({ library: "maximilian", variable: name });
                  } else if (init.type === "NewExpression" && exp.includes("MaxiInstruments(")) {
                    possibles.push({ library: "MaxiInstruments", variable: name });
                  } else if (init.type === "NewExpression" && exp.includes("Node(")) {
                    possibles.push({ library: "WebAudio", variable: name });
                  } else if (init.type === "CallExpression" && init.callee.property !== undefined) {
                    const webAudioFactories = ["createOscillator", "createBufferSource", "createMediaElementSource", "createBiquadFilter", "createMediaStreamTrackSource", "createDelay", "createDynamicsCompressor", "createGain", "createPeriodicWave"];
                    if (webAudioFactories.some(e => e === init.callee.property.name)) {
                      possibles.push({ library: "WebAudio", variable: name });
                    }
                  }
                }
              });
            }
          });
        } catch (err) {
          //this.get('cs').log(err);
        }
      }
      this.get('cs').log("possibles", possibles);
      return possibles;
    },
    insertStatefullCallbacks(src, savedVals) {
      let newSrc = "";
      this.set('savedVals', savedVals);
      this.set('hasPVals', false);
      let didEdit = false;
      this.get('cs').log("inserting stateful callbacks");
      const scripts = this.getScripts(src);
      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        newSrc = newSrc + script.preamble;
        let ops = [];
        let added = false;
        //this.get('cs').log("trying script", script.src);
        try {
          _walk.default.simple(_acorn.default.parse(script.src), {
            VariableDeclaration: node => {
              for (let i = 0; i < node.declarations.length; i++) {
                const dec = node.declarations[i];
                let name = dec.id.name;
                if (!name) {
                  name = script.src.substring(dec.id.start, dec.id.end);
                }
                const init = dec.init;
                let savedVal = this.get('savedVals')[name];
                const delim = i >= node.declarations.length - 1 ? ";" : ",";
                let exp = script.src.substring(dec.start, dec.end) + delim;
                if (name.substring(0, 2) == "p_") {
                  if (!init) {
                    savedVal = savedVal ? savedVal : 0;
                    exp = " = " + savedVal + delim;
                    ops.push({ si: exp, p: dec.end });
                  } else {
                    const msg = "\nparent.postMessage([\"" + name + "\",JSON.stringify(" + name + ")], \"*\");";
                    let index = dec.end;
                    const end = script.src.substring(index, index + 1);
                    if (end == ";") {
                      index++;
                    }
                    ops.push({ si: msg, p: index });
                  }
                  this.set('hasPVals', true);
                }
              }
            },
            AssignmentExpression: node => {
              let left = node.left;
              let name = left.name;
              while (!name) {
                if (left.object) {
                  left = left.object;
                } else {
                  name = left.name;
                  if (!name) {
                    name = script.src.substring(node.start, node.end);
                  }
                }
              }
              //If an object or a property of it is changed, update with a JSON version of the WHOLE object
              if (name.substring(0, 2) == "p_") {
                const msg = "\nparent.postMessage([\"" + name + "\",JSON.stringify(" + name + ")], \"*\");";
                let index = node.end;
                const end = script.src.substring(index, index + 1);
                if (end == ";") {
                  index++;
                }
                ops.push({ si: msg, p: index });
                this.set('hasPVals', true);
              }
            },
            CallExpression: node => {
              if (!Ember.isEmpty(node.callee.object)) {
                if (node.callee.object.name === "console") {
                  let output = "";
                  for (let j = 0; j < node.arguments.length; j++) {
                    const arg = node.arguments[j];
                    const val = script.src.substring(arg.start, arg.end);
                    let delim = j < node.arguments.length - 1 ? "," : "";
                    output = output + "JSON.stringify(" + val + ")" + delim;
                  }
                  this.get('cs').log("adding in console statement");
                  const msg = "\nparent.postMessage([\"console\"," + output + "], \"*\");";
                  let index = node.end;
                  const end = script.src.substring(index, index + 1);
                  if (end == ";") {
                    index++;
                  }
                  ops.push({ si: msg, p: index });
                }
              }
            }
          });
        } catch (err) {
          this.get('cs').log("acorn couldnt parse script, probably src");
        }
        if (ops.length > 0) {
          let offset = 0;
          let newScript = script.src;
          for (let j = 0; j < ops.length; j++) {
            didEdit = true;
            if (ops[j].si) {
              const str = ops[j].si;
              const index = ops[j].p + offset;
              newScript = newScript.slice(0, index) + str + newScript.slice(index);
              offset += str.length;
            } else if (ops[j].sd) {
              const len = ops[j].sd.length;
              const index = ops[j].p + offset;
              newScript = newScript.slice(0, index) + newScript.slice(index + len);
              offset -= len;
            }
          }
          added = true;
          newSrc = newSrc + script.scriptTag;
          newSrc = newSrc + newScript;
        }
        if (!added) {
          newSrc = newSrc + script.scriptTag;
          newSrc = newSrc + script.src;
        }
        newSrc = newSrc + script.post;
      }
      //this.get('cs').log("SOURCE",newSrc);
      return didEdit ? newSrc : src;
    },
    getScripts(source) {
      let searchIndex = 0,
          index = 0,
          ptr = 0,
          prevEnd = 0;
      let scriptStartIndex = 0,
          tagStartIndex = 0;
      let searchStrs = ['<script', ">", "</script>"];
      let scripts = [];
      let preamble = "",
          scriptTag = "";
      while ((index = source.indexOf(searchStrs[ptr], searchIndex)) > -1) {
        if (ptr == 0) {
          searchIndex = index;
          tagStartIndex = searchIndex;
          preamble = source.substring(prevEnd, searchIndex);
        } else if (ptr == 1) {
          searchIndex = index + searchStrs[ptr].length;
          scriptStartIndex = searchIndex;
          scriptTag = source.substring(tagStartIndex, searchIndex);
        } else if (ptr == 2) {
          searchIndex = index + searchStrs[ptr].length;
          const src = scriptStartIndex <= index - 1 ? source.substring(scriptStartIndex, index - 1) : "";
          scripts.push({
            preamble: preamble,
            scriptTag: scriptTag,
            src: src,
            post: "\n</script>"
          });
          prevEnd = searchIndex;
        }
        ptr = (ptr + 1) % searchStrs.length;
      }
      if (scripts.length > 0) {
        scripts[scripts.length - 1].post = scripts[scripts.length - 1].post + source.substr(prevEnd);
      }
      return scripts;
    },
    replaceAssets(source, assets, docId) {
      //this.get('cs').log("ORIGINAL", source)
      return new Ember.RSVP.Promise((resolve, reject) => {
        const replaceAll = async () => {
          for (let i = 0; i < assets.length; i++) {
            const fileId = assets[i].fileId;
            const toFind = assets[i].name;
            const fileType = assets[i].fileType;
            let asset = this.get('store').peekRecord('asset', fileId);

            //this.get('cs').log("replaceAssets",assets[i].size)
            const useBase64 = true;
            //If file is media replace with base64
            if (this.get('assetService').isMedia(fileType) && !this.get('assetService').isTooBig(assets[i].size) && useBase64) {
              if (!Ember.isEmpty(asset)) {
                const b64 = "data:" + fileType + ";charset=utf-8;base64," + asset.b64data;
                //this.get('cs').log("replaced base64")
                source = source.replace(new RegExp(toFind, "gm"), b64);
              } else {
                //this.get('cs').log("need to fetch asset for conversion");
                await this.get('assetService').fetchAsset(assets[i], docId);
                //this.get('cs').log("finding record");
                asset = this.get('store').peekRecord('asset', fileId);
                //this.get('cs').log("found record");
                const b64 = "data:" + fileType + ";charset=utf-8;base64," + asset.b64data;
                source = source.replace(new RegExp(toFind, "gm"), b64);
                //  this.get('cs').log("replaced base64")
              }
            } else {
              //Else just use endpoint
              const url = _environment.default.serverHost + "/asset/" + docId + "/" + toFind;
              //this.get('cs').log("replaced url", url)
              source = source.replace(new RegExp("\"" + toFind + "\"", "gm"), "\"" + url + "\"");
              source = source.replace(new RegExp("\'" + toFind + "\'", "gm"), "\"" + url + "\"");
              //this.get('cs').log(source)
            }
          }
          resolve(source);
        };
        replaceAll();
      });
    },
    /*
    We have rolled our own because the code mirror implementation
    (doc.indexFromPos) return incorrect values for {} when auto indented
    ALSO:Multi line undo error
    When you tab or shift tab multi lines, then undo we get bulked operations
    occuring with lines coming from bottom to top, this causes issues with
    "getLine()" its measuring lines in a doc post change (doesnt effect us top
    to bottom as it never reaches the lines below itself). This is fixed by sorting
    ops by line before
    */
    indexFromPos(pos, editor) {
      let index = 0;
      for (let i = 0; i < pos.line; i++) {
        //+ 1 for \n
        index += editor.getDoc().getLine(i).length + 1;
      }
      return index + pos.ch;
    },
    addOp(delta, editor) {
      const op = {};
      const start = this.indexFromPos(delta.from, editor);
      op.p = ['source', start];
      const str = delta.text.join('\n');
      op['si'] = str;
      op.owner = this.get('sessionAccount').currentUserName;
      op.cursor = editor.doc.getCursor();
      op.date = new Date().getTime();
      //this.get('cs').log("delta op", op);
      return op;
    },
    removeOp(delta, editor) {
      const op = {};
      const start = this.indexFromPos(delta.from, editor);
      op.p = ['source', start];
      const str = delta.removed.join('\n');
      op['sd'] = str;
      op.owner = this.get('sessionAccount').currentUserName;
      op.cursor = editor.doc.getCursor();
      op.date = new Date().getTime();
      //this.get('cs').log("delta op", op);
      return op;
    },
    getOps(delta, editor) {
      let ops = [];
      const compare = (a, b) => {
        if (a.from.line < b.from.line) {
          return -1;
        }
        if (a.from.line > b.from.line) {
          return 1;
        }
        return 0;
      };
      //Sort by line to avoid errors with undo (see explanation in comment by indexFromPos)
      delta = delta.sort(compare);
      delta.forEach(change => {
        if (change.origin === "playback") {
          this.get('cs').log("ignoring change");
          return ops;
        }
        if (change.removed[0].length > 0 && change.removed.length === 1 || change.removed.length > 1) {
          ops.push(this.removeOp(change, editor));
        }
        if (change.text[0].length > 0 && change.text.length === 1 || change.text.length > 1) {
          ops.push(this.addOp(change, editor));
        }
      });

      return ops;
    },
    applyOps: function (ops, editor) {
      let opToDelta = op => {
        const start = op.p[op.p.length - 1];
        const from = editor.doc.posFromIndex(start);
        if ('sd' in op) {
          const end = start + op.sd.length;
          const to = editor.doc.posFromIndex(end);
          this.get("cs").log("deleting", from, to);
          editor.doc.replaceRange("", from, to, "playback");
        } else if ('si' in op) {
          this.get("cs").log("adding", op.si);
          editor.doc.replaceRange(op.si, from, null, "playback");
        } else {
          throw new Error(`Invalid Operation: ${JSON.stringify(op)}`);
        }
      };
      ops.forEach(op => {
        opToDelta(op);
      });
      editor.refresh();
    },
    getLanguage(source) {
      let highlightResult = _highlight.default.highlightAuto(source, ["css", "javascript"]);
      //this.get('cs').log("language", highlightResult.language);
      return highlightResult.language;
    }
  });
});
;define('ember-share-db/services/console', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Service.extend({
    output: "--MIMIC--",
    init() {
      this._super(...arguments);
      this.set('observers', []);
      console.log("DEBUG INIT", _environment.default.debugConsole);
      this.setDebugMode(_environment.default.debugConsole);
    },
    clearObservers() {
      this.set('observers', []);
    },
    clear() {
      this.set('output', "--MIMIC--");
    },
    append(msg) {
      this.set('output', this.get('output') + "\n" + msg);
      const observers = this.get('observers');
      for (let i = 0; i < observers.length; i++) {
        observers[i].update();
      }
    },
    logToScreen() {
      const msgs = arguments;
      for (let i = 0; i < msgs.length; i++) {
        console.log(msgs[i]);
        this.append(msgs[i]);
      }
    },
    log() {},
    setDebugMode(debugEnabled) {
      if (debugEnabled && typeof console != 'undefined') {
        this.set('log', console.log.bind(console));
      } else {
        this.set('log', function (message) {});
      }
    }

  });
});
;define('ember-share-db/services/cookies', ['exports', 'ember-cookies/services/cookies'], function (exports, _cookies) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _cookies.default;
});
;define('ember-share-db/services/documents', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Service.extend({
    assetService: Ember.inject.service('assets'),
    store: Ember.inject.service('store'),
    sessionAccount: Ember.inject.service('session-account'),
    codeParser: Ember.inject.service('code-parsing'),
    cs: Ember.inject.service('console'),
    getDefaultSource() {
      return "<!DOCTYPE html>\n<html>\n<head>\n</head>\n<body>\n<script language=\"javascript\" type=\"text/javascript\">\n\n</script>\n</body>\n</html>";
    },
    makeNewDoc(data, forkedFrom = null, parent = null) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        this.get('cs').log("making doc", parent);
        const currentUser = this.get('sessionAccount').currentUserName;
        const currentUserId = this.get('sessionAccount').currentUserId;
        let doc = this.get('store').createRecord('document', {
          source: data.source,
          owner: currentUser,
          ownerId: currentUserId,
          isPrivate: data.isPrivate,
          name: data.name,
          documentId: null,
          forkedFrom: forkedFrom,
          parent: parent,
          tags: data.tags,
          assets: data.assets,
          assetQuota: data.assetQuota
        });
        doc.save().then(response => {
          this.get('cs').log("saved new doc");
          if (!Ember.isEmpty(parent)) {
            this.get('cs').log("NOT A PARENT, updating parent with myself as a child");
            this.get('store').findRecord('document', parent, { reload: true }).then(parentDoc => {
              let children = parentDoc.get('children');
              children.push(response.id);
              this.get('cs').log("updating", parent, children);
              this.updateDoc(parent, "children", children).then(() => {
                resolve(response);
              }).catch(err => {
                this.get('cs').log(err);
              });
            }).catch(err => {
              this.get('cs').log(err);
            });
          } else {
            resolve(response);
          }
        }).catch(err => {
          this.get('cs').log("error creating record");
          doc.deleteRecord();
          this.get('sessionAccount').updateOwnedDocuments();
          reject("error creating document, are you signed in?");
        });
      });
    },
    forkDoc(docId, children) {
      this.get('cs').log("forking", docId, children);
      return new Ember.RSVP.Promise((resolve, reject) => {
        this.get('store').findRecord('document', docId).then(doc => {
          //Clone object
          let newData = JSON.parse(JSON.stringify(doc));
          //Change name
          newData.name = "Fork of " + doc.get('name');
          this.makeNewDoc(newData, docId, null).then(newDoc => {
            const makeChildren = async c => {
              for (const child of c) {
                this.get('cs').log("making copy of child", child);
                await this.makeNewDoc(child, docId, newDoc.id);
              }
              this.get('cs').log("completed forking root + children");
              resolve(newDoc);
            };

            makeChildren(children);
          }).catch(err => reject(err));
        }).catch(err => reject(err));
      });
    },
    submitOp(op, doc) {
      if (Ember.isEmpty(doc)) {
        doc = this.get('sessionAccount').currentDoc;
      }
      const token = "Bearer " + this.get('sessionAccount').bearerToken;
      return new Ember.RSVP.Promise((resolve, reject) => {
        $.ajax({
          type: "POST",
          url: _environment.default.serverHost + "/submitOp",
          beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', token);
          },
          data: { op: op, documentId: doc }
        }).then(Ember.run.bind(res => {
          resolve();
        })).catch(Ember.run.bind(err => {
          reject(err);
        }));
      });
    },
    //Calls PATCH /documents on the server
    updateDoc(docId, field, value) {
      //this.get('cs').log("updateDoc",docId, field, value)
      return new Ember.RSVP.Promise((resolve, reject) => {
        this.get('store').findRecord('document', docId).then(doc => {
          if (!Ember.isEmpty(doc) && !(doc.get('isDestroyed') || doc.get('isDestroying'))) {
            //this.get('cs').log("got doc, setting field", field, value)
            doc.set(field, value);
            doc.save().then(newDoc => {
              //this.get('cs').log("updated", field, "successfully to", value);
              resolve(newDoc);
            }).catch(err => {
              this.get('cs').log("documentservice, updateDoc1", err);
              reject(err);
            });
          } else {
            this.get('cs').log("failed to find doc");
            reject();
          }
        }).catch(err => {
          this.get('cs').log("documentservice, updateDoc2", err);
          reject(err);
        });
      });
    },
    getPopularTags(limit) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        $.ajax({
          type: "GET",
          url: _environment.default.serverHost + "/tags?limit=" + limit
        }).then(Ember.run.bind(res => {
          this.get('cs').log("tags", res);
          resolve(res);
        })).catch(Ember.run.bind(err => {
          reject(err);
        }));
      });
    },
    deleteDoc(docId) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        this.get('store').findRecord('document', docId).then(doc => {
          this.get('cs').log('deleting doc : ' + doc.parent ? "parent" : "child");
          this.get("cs").log(doc.assets);
          let actions = doc.assets.map(a => {
            return this.get('assetService').deleteAsset(a.name, docId);
          });
          actions.concat(doc.children.map(c => this.deleteDoc(c)));
          Promise.all(actions).then(() => {
            const token = "Bearer " + this.get('sessionAccount').bearerToken;
            this.get('cs').log("resolved promise (children, assets), deleting from server");
            $.ajax({
              type: "DELETE",
              url: _environment.default.serverHost + "/documents/" + docId,
              beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', token);
              }
            }).then(Ember.run.bind(res => {
              this.get('cs').log('deleted', docId);
              const actions = [doc.deleteRecord(), this.get('sessionAccount').updateOwnedDocuments()];
              Promise.all(actions).then(resolve).catch(reject);
            })).catch(Ember.run.bind(err => {
              this.get('cs').log('error deleting', docId);
              reject(err);
            }));
          });
        });
      });
    },
    flagDoc() {
      const doc = this.get('sessionAccount').currentDoc;
      const user = this.get('sessionAccount').currentUserName;
      const token = "Bearer " + this.get('sessionAccount').bearerToken;
      const params = "?user=" + user + "&documentId=" + doc;
      this.get('cs').log('flagging doc', { user: user, documentId: doc });
      return new Ember.RSVP.Promise((resolve, reject) => {
        $.ajax({
          type: "GET",
          url: _environment.default.serverHost + "/flagDoc" + params,
          beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', token);
          }
        }).then(Ember.run.bind(res => {
          resolve();
        })).catch(Ember.run.bind(err => {
          reject(err);
        }));
      });
    },
    getSource(docId) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        $.ajax({
          type: "GET",
          url: _environment.default.serverHost + "/source/" + docId
        }).then(Ember.run.bind(res => {
          resolve(res);
        })).catch(Ember.run.bind(err => {
          reject(err);
        }));
      });
    },
    getChildren(childrenIds) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        if (childrenIds.length == 0) {
          resolve({ children: {}, parent: {} });
          return;
        }
        let fetch = docId => {
          return new Ember.RSVP.Promise((res, rej) => {
            this.get('store').findRecord('document', docId).then(doc => res(doc)).catch(err => rej(err));
          });
        };
        let actions = childrenIds.map(fetch);
        Promise.all(actions).then(children => {
          fetch(children[0].get('parent')).then(parent => {
            resolve({ children: children, parent: parent });
          }).catch(err => resolve(children));
        }).catch(err => reject(err));
      });
    },
    addRecording(src, options) {
      return this.get('codeParser').insertRecording(src, options);
    },
    getCombinedSource(docId, replaceAssets = false, mainText, savedVals) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        this.get('store').findRecord('document', docId).then(doc => {
          this.getChildren(doc.get('children')).then(childDocs => {
            if (Ember.isEmpty(mainText)) {
              mainText = doc.get('source');
            }
            if (Ember.isEmpty(savedVals)) {
              savedVals = doc.get('savedVals');
            }
            let combined = mainText;
            combined = this.get('codeParser').insertTabs(combined, childDocs.children, doc.get('assets'));
            combined = this.get('codeParser').replaceNoCORSResources(combined);
            combined = this.get('codeParser').insertStatefullCallbacks(combined, savedVals);
            combined = this.get('codeParser').insertDatasetId(combined, docId);
            console.log(combined);
            if (replaceAssets) {
              //this.get('cs').log("doc service", docId)
              this.get('codeParser').replaceAssets(combined, doc.get('assets'), docId).then(withAssets => {
                resolve(withAssets);
              });
            } else {
              resolve(combined);
            }
          });
        }).catch(err => reject(err));
      });
    }
  });
});
;define('ember-share-db/services/examples', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Service.extend({
    examples: Ember.computed(() => {
      return [{ title: "User Input", examples: [
        //
        { id: "kick-classifier", docid: "a4c91621-199c-65b5-e355-2aadfc27c33f", desc: "Control this audio track with objects and your webcam" },
        //
        { id: "sun-on-your-skin", docid: "2fdd8ba2-3cb8-1838-49a5-fe9cfe6650ed", desc: "Map the movements of your body to a synth soundscape." }, { id: "space-drum", docid: "fd439a02-9ca3-b9db-9054-40aa3aa5cbb5", desc: "What if the drum machine can understand your tapping and make up all the details for you?" }, { id: "auto-pilot", docid: "37bd95c1-c1ff-a09a-55eb-eb8cc4884e88", desc: "Make a 2D parameter map for theis synth then plot journeys around it!" }] }, { title: "Generative Music", examples: [

        //merk
        { id: "merk", docid: "305ac2de-3362-6c8d-e04c-d5a1072cc1c5", desc: "A Remapping of Magenta's MusicVAE drum models from London, UK. We sample the latent space, squish the hihats and play around with the drum mappings to see what happens if we make things a little bit more grimey. " },
        //mario
        { id: "mario", docid: "a8baea19-711f-4e43-46ab-71e5212ed5db", desc: "What if AI finished the Mario theme song? Use Magenta's MusicRNN model to experiment with different continuations of the catchiest computer game music" },
        //markov
        { id: "markov", docid: "5f827ca2-aae0-b755-e432-f815c00a482a", desc: "Quickly build your own generative drum models using keyboard input." }] }, { title: "Audio Remix", examples: [
        //LSTM
        { id: "magnet", docid: "84bf177b-af84-85c3-4933-32076561aca0", desc: " This demonstrates an LSTM audio generation process using MAGNet, a spectral approach to audio analysis and generation with neural networks. The techniques included here were used as part of the Mezzanine Vs. MAGNet project featured as part of the Barbican's AI: More than Human exhibition. Here you can try out some pre-trained models. " },
        //bbcut
        { id: "bbcut", docid: "50568259-fd05-e122-aa39-d3e39e39a6c0", desc: "BBCut is a remix library based on MMLL.js for beat tracking. The input is cut up live into stuttering buffers, with the cut points determined by tracking of the primary metrical level in the music." }] }, { title: "Synthesis", examples: [
        //evolib
        { id: "evolib", docid: "3e67cfd2-c171-5bf1-db4c-a5b0cde68e7e", desc: "Evolib.js is a library for using a genetic algorithm to breed virtual modular synthesizer patches. Breed sounds together to make new ones!" },
        //conceptualr synth
        { id: "conceptular", docid: "83b58e5e-487f-fd88-158e-239d85202bce", desc: "Conceptular Beat Synthesiser is a drum machine powered by machine learning.  There are no samples, instead the system uses neural network models of sounds. The real power of this synthesiser lies in the way you can manipulate the sound models using parameterised envelopes." }] }, { title: "Audio FX", examples: [
        //spectral delay
        { id: "specdelay", docid: "e8524aa9-d6a6-0809-83ef-e7b0891802bc", desc: "Spectral delay based on spectral resynthesis. The input is analysed by FFT, then particular spectral bins can be independently delayed and fed back on themselves to make a diffuse delayed filterbank." }] }, { title: "Text", examples: [
        //lyrics
        { id: "lyrics", docid: "66a88951-a7d6-cc9f-0d8b-b043e4b952b0", desc: "Having trouble writing the lyrics to your song? Using a pre-trained model on common English words, we can find similar words , find an \"average\" of two words, and \"solve\" two words like an analogy " }] }];
    })
  });
});
;define('ember-share-db/services/google-analytics', ['exports', 'ember-tracker/services/google-analytics'], function (exports, _googleAnalytics) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _googleAnalytics.default;
    }
  });
});
;define('ember-share-db/services/guides', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Service.extend({
    guides: Ember.computed(() => {
      return [{ title: "Interactive Machine Learning", guides: [{ id: "supervised-ml", name: "Basic Supervised Learning", desc: "Learn about supervised machine learning and how you can build interactive music systems in the browser using just examples", author: "Louis McCallum" }, { id: "learner", name: "Building Mappings by Example with Learner.js", desc: "Learner.js provides an interface that allows you to easily record in examples of input and output pairings. You can then train a model to respond with new outputs when you provide new inputs. We take care of all the storage, threading and GUI needs and all you have to do is pick what you want to control!", author: "Louis McCallum" }, { id: "kadenze", name: "Machine Learning for Musicians and Artists alongside Kadenze", desc: "Translating Wekinator based exercises to the MIMIC platform from Rebecca Fiebrink's excellent Kadenze course", author: "Louis McCallum" }, { id: "RAPIDMIX", name: "Using RapidLib.js for Machine Learning", desc: " This page provides a minimal guide on how to use the RapidLib, showing how to use simple machine learning objects in five steps with two simple examples of applied Machine Learning tasks.", author: "Franciso Bernardo" }] }, { title: "Making Music", guides: [{ id: "maxi-instrument", name: "AudioWorklet Backed Synths and Samplers with MaxiInstuments.js", desc: "MaxiInstruments is a class of simple synths and samplers that are designed to so that their parameters can be easily controlled using the Learner.js library. They are AudioWorklets backed so do not get interrupted by beefy feature extractors one might use an an input or the running of a model to do the mapping. ", author: "Louis McCallum" }, { id: "maximJS", name: "Making Music in the Browser with maxmilian.js", desc: "Maximilian.js is a javascript library for sound analysis and synthesis. This document is a reference to the maxmilian.js API, illustrated with examples.", author: "Chris Kiefer and Louis McCallum" }, { id: "evolib", name: "Evolutionary Sound Synthesis with Evolib.js", desc: "How about using a machine intelligence technique to help us to program a modular synthesizer? In this guide, we'll show you how", author: "Matthew Yee-King" }] }, { title: "Musical Analysis", guides: [{ id: "mmll", name: "Musical Machine Listening with MMLL.js", desc: "Machine listening is the attempt to make computers hear sound intelligently. The interest of the MIMIC project is in musical machine listening, that is, the computer understanding of musical audio signals, and the Musical Machine Listening Library introduced here (subsequently MMLL) is a javascript library to do just that, in the web browser. ", author: "Nick Collins" }] }, { title: "The Platform", guides: [{ id: "recording", name: "In-Built Recording in MIMIC", desc: "How to record yourself in the MIMIC platform (and WTF are nodes?).", author: "Louis McCallum" }, { id: "colab", name: "Collaborative Coding on MIMIC", desc: "MIMIC allows for both collaborative and remote coding (great for teaching!). Learn how", author: "Louis McCallum" }] }];
    })
  });
});
;define('ember-share-db/services/library', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Service.extend({
    libraryMap: Ember.computed(() => {
      return [{ title: "MMLL", id: "mmll", url: "MMLL.js" }, { title: "RapidLib", id: "rapidlib", url: "rapidLib.js" }, { title: "Learner.js", id: "learner", url: "learner.v.0.2.js" }, { title: "Maxi Instrument", id: "maxiinstrument", url: "maxiInstruments.v.0.7.js" }, { title: "MIMIC Samples", id: "mimicSamples", url: "mimicSamples.js" }, { title: "maximilian.js", id: "maximilian", url: "maximilian.v.0.1.js" }, { title: "EvoLib", id: "evolib", url: "evolib.js" }, { title: "Nexus", id: "nexusUI", url: "nexusUI.js" }, { title: "Processing", id: "processing.js", url: "processing.js" }, { title: "p5", id: "p5", url: "p5.min.js" }, { title: "SoundJS", id: "SoundJS", url: "soundjs.js" }, { title: "Marked", id: "Marked", url: "marked.js" }];
    }),
    url(id) {
      let url = "";
      this.get('libraryMap').forEach(lib => {
        if (lib.id == id) {
          url = lib.url;
        }
      });
      return url;
    }
  });
});
;define('ember-share-db/services/media-queries', ['exports', 'ember-cli-media-queries/services/media-queries'], function (exports, _mediaQueries) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _mediaQueries.default.extend({
    media: Ember.computed(() => {
      return {
        xs: '(max-width: 575px)',
        sm: '(min-width: 576px) and (max-width: 767px)',
        md: '(min-width: 768px) and (max-width: 991px)',
        lg: '(min-width: 992px) and (max-width: 1999px)',
        xl: '(min-width: 1200px)',
        mobile: '(max-width: 767px)',
        desktop: '(min-width: 768px)',
        docs: '(min-width: 1050px)',
        burger: '(max-width: 450px)'
      };
    })
  });
});
;define('ember-share-db/services/modals-manager', ['exports', 'ember-bootstrap-modals-manager/services/modals-manager'], function (exports, _modalsManager) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _modalsManager.default;
    }
  });
});
;define('ember-share-db/services/ops-player', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Service.extend({
    parser: Ember.inject.service('code-parsing'),
    sessionAccount: Ember.inject.service('session-account'),
    cs: Ember.inject.service('console'),
    ops: null,
    opsToApply: null,
    fromPlayer: [],
    prevDir: null,
    doc: null,
    reset(doc) {
      this.set('doc', doc);
      this.set('ops', null);
    },
    getToSend() {
      let toSend = [];
      if (this.get("fromPlayer").length > 0) {
        toSend = JSON.parse(JSON.stringify(this.get('fromPlayer')));
        this.set("fromPlayer", []);
      }
      return toSend;
    },
    //Called every 100ms, collects ops that are before given time
    //on the the fromPlayer array
    executeUntil(time, justSource = false) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        let toSend = [];
        if (!Ember.isEmpty(this.get("ops"))) {
          this.get("ops").forEach(currentOp => {
            let send = false;
            //Docs made earlier than 20/3/21 wont work with this (no dates!)
            currentOp.op.forEach(op => {
              //this.get('cs').log("executeUntil",op)
              let hasDate = false;
              if (op.oi) {
                if (op.oi.date) {
                  hasDate = true;
                  if (op.oi.date < time) {
                    this.get("cs").log(op.oi.date - time);
                    send = true;
                  }
                }
              }
              //.si text ops have date a level higher than .oi json ops
              if (op.date) {
                hasDate = true;
                if (op.date < time) {
                  this.get("cs").log(op.date - time);
                  send = true;
                }
              }
              if (!hasDate) {
                //Dont send if no date, unless first op
                send = currentOp.v < 2;
              }
              if (justSource && op.p[0] !== "source") {
                send = false;
              }
            });
            if (send) {
              this.get("cs").log("sending", currentOp.v, currentOp.op[0].p[0], justSource, currentOp.op[0]);
              toSend.push(currentOp);
            } else {
              //this.get("cs").log("skipping",currentOp,justSource)
            }
          });
        }
        toSend.forEach(currentOp => {
          this.set("latestVersion", currentOp.v + 1);
          this.get("fromPlayer").push(currentOp);
          //Remove ops once sent
          const index = this.get('ops').indexOf(currentOp);
          if (index > -1) {
            this.get('ops').splice(index, 1);
          }
        });
        resolve();
      });
    },
    fastForwardsLatestVersion() {
      if (!Ember.isEmpty(this.get("ops"))) {
        this.get("ops").forEach(op => {
          if (this.get("latestVersion") < op.v) {
            this.set("latestVersion", op.v);
          }
        });
      }
      this.set("latestVersion", this.get("latestVersion") + 1);
      this.get("cs").log("fastforwarded to ", this.get("latestVersion"));
    },
    //Called when document is loaded from code-editor.js
    startTimer(editor) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        this.set("latestVersion", 0);
        //Load all the ops
        this.loadOps(0).then(() => {
          const lag = 10000;
          const interval = 100;
          let now;
          this.cleanUp();
          let justSource = true;
          //Set the latestVersion to the most recent op
          this.fastForwardsLatestVersion();
          //Clear all the ops
          this.set("ops", []);
          //Start counter to update ops every "lag" seconds
          this.get("cs").log("starting op timer", lag);
          this.set("updateOpsInterval", setInterval(() => {
            this.loadOps(this.get("latestVersion")).then(() => {
              justSource = false;
            });
          }, lag));
          //Start counter to check for ops to playback every "interval" seconds
          this.set("schedulerInteval", setInterval(() => {
            now = new Date().getTime() - lag;
            this.executeUntil(now, justSource);
          }, interval));
          resolve();
        });
      });
    },
    //Remove any ops that are not re-evaluations or code updates
    filterOps(toFilter) {
      let sourceOps = [];
      toFilter.forEach(ops => {
        if (ops.op !== undefined) {
          if (ops.op.length > 0) {
            if (ops.op[0].p[0] === "newEval" || ops.op[0].p[0] === "source") {
              sourceOps.push(ops);
            }
          }
        }
      });
      return sourceOps;
    },
    loadOps(from = 0) {
      const doc = this.get('doc');
      this.get('cs').log("loading ops", doc, from);
      return new Ember.RSVP.Promise((resolve, reject) => {
        let url = _environment.default.serverHost + "/documents/ops/" + doc;
        url = url + "?version=" + from;
        $.ajax({
          type: "GET",
          url: url
          //headers: {'Authorization': 'Bearer ' + this.get('sessionAccount.bearerToken')}
        }).then(res => {
          if (res) {
            this.set('ops', this.filterOps(res.data));
          } else {
            this.set('ops', []);
          }
          this.get('cs').log("GOT OPS", from, this.get('ops').length);
          // for(const op of this.get('ops')) {
          //   this.get('cs').log(op)
          // }
          resolve(this.get('ops'));
        }).catch(err => {
          this.get("cs").log("op GET rejected", err);
          reject(err);
        });
      });
    },
    //Clears all the timers
    cleanUp() {
      this.get("cs").log("cleaned up op player");
      this.set("latestVersion", 0);
      if (!Ember.isEmpty(this.get("schedulerInteval"))) {
        clearInterval(this.get("schedulerInteval"));
        this.set("schedulerInteval", null);
      }
      if (!Ember.isEmpty(this.get("updateOpsInterval"))) {
        clearInterval(this.get("updateOpsInterval"));
        this.set("updateOpsInterval", null);
      }
    },
    applyTransform(editor) {
      //this.get('cs').log("applying", this.get('opsToApply'))
      if (!Ember.isEmpty(this.get('opsToApply'))) {
        return this.get('parser').applyOps(this.get('opsToApply'), editor);
      } else {
        return [];
      }
    }
  });
});
;define('ember-share-db/services/password-reset', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Service.extend({
    sessionAccount: Ember.inject.service('session-account'),
    cs: Ember.inject.service('console'),
    requestReset(username) {
      this.get('cs').log("reset pword for " + username);
      return new Ember.RSVP.Promise((resolve, reject) => {
        $.ajax({
          type: "POST",
          url: _environment.default.serverHost + "/resetPassword",
          data: { username: username, hostURL: _environment.default.localOrigin }
        }).then(Ember.run.bind(res => {
          this.get('cs').log("success", res);
          resolve();
        })).catch(Ember.run.bind(err => {
          this.get('cs').log("error", err.responseText);
          reject(err.responseText);
        }));
      });
    },
    updatePassword(username, token, newPassword) {
      this.get('cs').log("updatePassword to " + newPassword + " with " + token + " for " + username);
      return new Ember.RSVP.Promise((resolve, reject) => {
        $.ajax({
          type: "POST",
          url: _environment.default.serverHost + "/updatePassword",
          data: { username: username, token: token, password: newPassword }
        }).then(Ember.run.bind(res => {
          this.get('cs').log("success", res);
          resolve();
        })).catch(Ember.run.bind(err => {
          this.get('cs').log("error", err);
          reject(err);
        }));
      });
    },
    checkToken(username, token) {
      this.get('cs').log("check token " + token + " for " + username);
      return new Ember.RSVP.Promise((resolve, reject) => {
        $.ajax({
          type: "POST",
          url: _environment.default.serverHost + "/checkPasswordToken",
          data: { username: username, token: token }
        }).then(Ember.run.bind(res => {
          this.get('cs').log("success", res);
          resolve();
        })).catch(Ember.run.bind(err => {
          this.get('cs').log("error", err);
          reject(err);
        }));
      });
    }
  });
});
;define('ember-share-db/services/resize', ['exports', 'ember-resize/services/resize'], function (exports, _resize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _resize.default;
    }
  });
});
;define('ember-share-db/services/session-account', ['exports', 'ember-share-db/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Service.extend({
    session: Ember.inject.service('session'),
    uuid: Ember.inject.service(),
    store: Ember.inject.service(),
    cs: Ember.inject.service('console'),
    currentUserName: "",
    currentUserId: null,
    bearerToken: "",
    currentDoc: "",
    ownedDocuments: null,
    getSessionID() {
      if (Ember.isEmpty(this.get("sessionID"))) {
        this.set("sessionID", this.get("uuid").guid());
      }
      return this.get("sessionID");
    },
    updateOwnedDocuments() {
      return new Ember.RSVP.Promise((resolve, reject) => {
        let currentUser = this.get('currentUserName');
        if (!currentUser) {
          currentUser = "";
        }
        let userID = this.get('currentUserId');
        const filter = {
          filter: { search: currentUser, page: 0, currentUser: userID, sortBy: "updated" }
        };
        this.get('store').query('document', filter).then(results => {
          var myDocs = results.map(function (doc) {
            return { id: doc.get('id'), name: doc.get('name') };
          });
          this.set('ownedDocuments', myDocs);
          resolve();
        }).catch(err => {
          reject(err);
        });
      });
    },
    getUserFromName() {
      return new Ember.RSVP.Promise((resolve, reject) => {
        const username = this.get('currentUserName');
        const token = this.get('bearerToken');
        this.get('cs').log("getUserFromName");
        $.ajax({
          type: "GET",
          url: _environment.default.serverHost + "/accounts",
          beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', token);
          },
          data: { username: username }
        }).then(Ember.run.bind(res => {
          this.get('cs').log("USERID", res.data.attr.accountId);
          this.set("currentUserId", res.data.attr.accountId);
          resolve(res);
        })).catch(Ember.run.bind(err => {
          this.get('cs').log(err);
          reject(err);
        }));
      });
    },
    loadCurrentUser() {
      return new Ember.RSVP.Promise((resolve, reject) => {
        this.get('cs').log(this.get('session.data'));
        const currentUserName = this.get('session.data.authenticated.user_id');
        this.set('bearerToken', this.get('session.data.authenticated.access_token'));
        if (!Ember.isEmpty(currentUserName)) {
          this.set('currentUserName', currentUserName);
          resolve();
        } else {
          this.get('cs').log('currentUserName empty, rejecting');
          reject();
        }
      });
    }
  });
});
;define('ember-share-db/services/session', ['exports', 'ember-simple-auth/services/session'], function (exports, _session) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _session.default;
});
;define('ember-share-db/services/socket-io', ['exports', 'ember-websockets/services/socket-io'], function (exports, _socketIo) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _socketIo.default;
    }
  });
});
;define('ember-share-db/services/uuid', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Service.extend({
    guid: function () {
      return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' + this.s4() + this.s4() + this.s4();
    },
    s4: function () {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
  });
});
;define('ember-share-db/services/websockets', ['exports', 'ember-websockets/services/websockets'], function (exports, _websockets) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _websockets.default;
    }
  });
});
;define('ember-share-db/session-stores/application', ['exports', 'ember-simple-auth/session-stores/adaptive'], function (exports, _adaptive) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _adaptive.default.extend();
});
;define("ember-share-db/templates/about", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "ijLabBih", "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"id\",\"about-container\"],[9],[0,\"\\n  \"],[7,\"div\"],[11,\"class\",\"center-cropped\"],[12,\"style\",[30,[\"background-image: url('\",[29,\"concat\",[[25,[\"url\"]],\"/bg-bw.jpeg\"],null],\"');\"]]],[9],[0,\"\\n\"],[10],[0,\"\\n  \"],[1,[23,\"about-description\"],false],[0,\"\\n  \"],[7,\"div\"],[11,\"id\",\"about-text-container\"],[9],[0,\"\\n    \"],[7,\"p\"],[11,\"class\",\"about-text\"],[9],[0,\"\\n      MIMIC is a web platform for the artistic exploration of musical machine learning and machine listening. We have designed this collaborative platform as an interactive online coding environment, engineered to bring new technologies in AI and signal processing to artists, composers, musicians and performers all over the world.\\n    \"],[10],[0,\"\\n    \"],[7,\"p\"],[11,\"class\",\"about-text\"],[9],[0,\"\\n      The MIMIC platform has a built-in audio engine, machine learning and machine listening tools that makes it easy for creative coders to get started using these techniques in their own artistic projects. The platform also includes various examples of how to integrate external machine learning systems for sound, music and art making. These examples can be forked and further developed by the users of the platform.\\n    \"],[10],[0,\"\\n    \"],[7,\"p\"],[11,\"class\",\"about-text\"],[9],[0,\"\\n      Over the next three years, we aim to integrate brand new and developing creative systems into this platform so that they can be more easily used by musicians and artists in the creation of entirely new music, sound, and media, enabling people to understand and apply new computational techniques such as Machine Learning in their own creative work.\\n    \"],[10],[0,\"\\n    \"],[7,\"p\"],[11,\"class\",\"about-text\"],[9],[0,\"\\n      MIMIC or \\\"Musically Intelligent Machines Interacting Creatively\\\" is a three year AHRC-funded project, run by teams at Goldsmiths College, Durham University and the University of Sussex. \"],[7,\"a\"],[12,\"href\",[23,\"peopleURL\"]],[9],[0,\" Meet the team\"],[10],[0,\".\\n    \"],[10],[0,\"\\n    \"],[7,\"p\"],[11,\"class\",\"about-text\"],[9],[0,\"\\n      Find our terms and conditions \"],[7,\"a\"],[12,\"href\",[23,\"termsURL\"]],[9],[0,\"here\"],[10],[0,\"\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n  \"],[7,\"div\"],[11,\"id\",\"logo-footer\"],[9],[0,\"\\n    \"],[7,\"div\"],[11,\"id\",\"logo-container\"],[9],[0,\"\\n      \"],[7,\"div\"],[11,\"class\",\"row\"],[9],[0,\"\\n        \"],[7,\"div\"],[11,\"class\",\"col-md-2 col-sm-4 footer-logo-cell\"],[9],[0,\"\\n          \"],[7,\"img\"],[11,\"class\",\"footer-logo-img\"],[11,\"alt\",\"goldsmiths logo\"],[11,\"id\",\"gs-logo\"],[12,\"src\",[29,\"concat\",[[25,[\"url\"]],\"/1-Goldsmiths.png\"],null]],[9],[10],[0,\"\\n        \"],[10],[0,\"\\n        \"],[7,\"div\"],[11,\"class\",\"col-md-2 col-sm-4 footer-logo-cell\"],[9],[0,\"\\n          \"],[7,\"img\"],[11,\"class\",\"footer-logo-img\"],[11,\"alt\",\"durham logo\"],[11,\"id\",\"durham-logo\"],[12,\"src\",[29,\"concat\",[[25,[\"url\"]],\"/2-Durham.png\"],null]],[9],[10],[0,\"\\n        \"],[10],[0,\"\\n        \"],[7,\"div\"],[11,\"class\",\"col-md-2 col-sm-4 footer-logo-cell\"],[9],[0,\"\\n          \"],[7,\"img\"],[11,\"class\",\"footer-logo-img\"],[11,\"alt\",\"sussex logo\"],[11,\"id\",\"sussex-logo\"],[12,\"src\",[29,\"concat\",[[25,[\"url\"]],\"/3-Sussex.png\"],null]],[9],[10],[0,\"\\n        \"],[10],[0,\"\\n        \"],[7,\"div\"],[11,\"class\",\"col-md-2 col-sm-4 footer-logo-cell\"],[9],[0,\"\\n          \"],[7,\"img\"],[11,\"class\",\"footer-logo-img\"],[11,\"alt\",\"u a l logo\"],[11,\"id\",\"ual-logo\"],[12,\"src\",[29,\"concat\",[[25,[\"url\"]],\"/4-UAL.png\"],null]],[9],[10],[0,\"\\n        \"],[10],[0,\"\\n        \"],[7,\"div\"],[11,\"class\",\"col-md-2 col-sm-4 footer-logo-cell\"],[9],[0,\"\\n          \"],[7,\"img\"],[11,\"class\",\"footer-logo-img\"],[11,\"alt\",\"google logo \"],[11,\"id\",\"google-logo\"],[12,\"src\",[29,\"concat\",[[25,[\"url\"]],\"/5-Google.png\"],null]],[9],[10],[0,\"\\n        \"],[10],[0,\"\\n        \"],[7,\"div\"],[11,\"class\",\"col-md-2 col-sm-4 footer-logo-cell\"],[9],[0,\"\\n          \"],[7,\"img\"],[11,\"class\",\"footer-logo-img\"],[11,\"alt\",\"a h r c logo\"],[11,\"id\",\"ahrc-logo\"],[12,\"src\",[29,\"concat\",[[25,[\"url\"]],\"/6-AHRC.png\"],null]],[9],[10],[0,\"\\n        \"],[10],[0,\"\\n      \"],[10],[0,\"\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/about.hbs" } });
});
;define("ember-share-db/templates/api", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "7mfjFFKe", "block": "{\"symbols\":[],\"statements\":[[1,[23,\"outlet\"],false]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/api.hbs" } });
});
;define("ember-share-db/templates/application", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "2ZjxJfkY", "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"id\",\"main-site-container\"],[9],[0,\"\\n  \"],[1,[29,\"main-navigation\",null,[[\"onLogin\",\"onAbout\",\"onPeople\",\"onDocs\",\"onExamples\",\"onInputs\",\"onOutputs\",\"onGuides\",\"onGettingStarted\",\"openDoc\",\"openUserDocs\",\"openGuide\",\"onCreateDoc\"],[[29,\"action\",[[24,0,[]],\"transitionToLoginRoute\"],null],[29,\"action\",[[24,0,[]],\"transitionToAboutRoute\"],null],[29,\"action\",[[24,0,[]],\"transitionToPeopleRoute\"],null],[29,\"action\",[[24,0,[]],\"transitionToDocsRoute\"],null],[29,\"action\",[[24,0,[]],\"transitionToExamplesRoute\"],null],[29,\"action\",[[24,0,[]],\"transitionToInputsRoute\"],null],[29,\"action\",[[24,0,[]],\"transitionToOutputsRoute\"],null],[29,\"action\",[[24,0,[]],\"transitionToGuidesRoute\"],null],[29,\"action\",[[24,0,[]],\"transitionToGSRoute\"],null],[29,\"action\",[[24,0,[]],\"transitionToDoc\"],null],[29,\"action\",[[24,0,[]],\"transitionToUserDocs\"],null],[29,\"action\",[[24,0,[]],\"transitionToGuide\"],null],[29,\"action\",[[24,0,[]],\"transitionToNewestDoc\"],null]]]],false],[0,\"\\n  \"],[7,\"div\"],[9],[0,\"\\n    \"],[1,[23,\"outlet\"],false],[0,\"\\n    \"],[1,[23,\"modals-container\"],false],[0,\"\\n  \"],[10],[0,\"\\n  \"],[1,[23,\"mimic-footer\"],false],[0,\"\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/application.hbs" } });
});
;define("ember-share-db/templates/code-editor", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "aqPT1eOt", "block": "{\"symbols\":[\"asset\",\"lib\"],\"statements\":[[7,\"div\"],[11,\"id\",\"document-container\"],[9],[0,\"\\n  \"],[7,\"header\"],[9],[0,\"\\n  \"],[7,\"div\"],[11,\"id\",\"code-header-container\"],[11,\"class\",\"limited-width-container\"],[9],[0,\"\\n  \"],[7,\"h4\"],[9],[7,\"span\"],[9],[1,[23,\"feedbackMessage\"],false],[10],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"isEmbedded\"]]],null,{\"statements\":[[0,\"  \"],[7,\"div\"],[9],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"  \"],[7,\"div\"],[11,\"id\",\"doc-title-container\"],[9],[0,\"\\n\"],[4,\"if\",[[25,[\"isNotEdittingDocName\"]]],null,{\"statements\":[[0,\"        \"],[7,\"span\"],[11,\"id\",\"doc-title\"],[11,\"class\",\"label label-default\"],[11,\"role\",\"button\"],[11,\"tabIndex\",\"0\"],[11,\"for\",\"doc-name\"],[9],[1,[23,\"titleName\"],false],[3,\"action\",[[24,0,[]],\"doEditDocName\"]],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[1,[29,\"input\",null,[[\"role\",\"value\",\"type\",\"id\",\"name\",\"focusOut\"],[\"form\",[25,[\"titleNoName\"]],\"form-control\",\"doc-name-input\",\"doc-name-input\",[29,\"action\",[[24,0,[]],\"endEdittingDocName\"],null]]]],false],[0,\"\\n\"]],\"parameters\":[]}],[4,\"if\",[[25,[\"mediaQueries\",\"isDesktop\"]]],null,{\"statements\":[[0,\"    \"],[7,\"div\"],[11,\"id\",\"doc-controls-container\"],[9],[0,\"\\n      \"],[7,\"div\"],[12,\"id\",[29,\"concat\",[\"render-doc-\",[25,[\"isOwner\"]]],null]],[9],[0,\"\\n        \"],[10],[0,\"\\n          \"],[7,\"div\"],[11,\"id\",\"transport-container\"],[9],[0,\"\\n            \"],[7,\"div\"],[11,\"class\",\"tooltip col-2\"],[9],[0,\"\\n              \"],[4,\"bs-button\",null,[[\"icon\",\"id\",\"class\",\"onClick\",\"__HTML_ATTRIBUTES__\"],[\"glyphicon glyphicon-play\",\"code-play-btn\",\"clear-btn transport-btn\",[29,\"action\",[[24,0,[]],\"playOrPause\"],null],[29,\"hash\",null,[[\"aria-label\"],[\"Render Code\"]]]]],{\"statements\":[],\"parameters\":[]},null],[0,\"\\n              \"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[0,\"Render Code\"],[10],[0,\"\\n            \"],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"canEditSource\"]]],null,{\"statements\":[[0,\"              \"],[7,\"div\"],[11,\"class\",\"tooltip\"],[9],[0,\"\\n\"],[4,\"if\",[[25,[\"showAssets\"]]],null,{\"statements\":[[0,\"                  \"],[4,\"bs-button\",null,[[\"class\",\"icon\",\"onClick\",\"__HTML_ATTRIBUTES__\"],[\"clear-btn transport-btn\",\"glyphicon glyphicon-chevron-up\",[29,\"action\",[[24,0,[]],\"toggleShowAssets\"],null],[29,\"hash\",null,[[\"aria-label\"],[\"hide assets\"]]]]],{\"statements\":[],\"parameters\":[]},null],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"                  \"],[4,\"bs-button\",null,[[\"class\",\"icon\",\"onClick\",\"__HTML_ATTRIBUTES__\"],[\"clear-btn transport-btn\",\"glyphicon glyphicon-file\",[29,\"action\",[[24,0,[]],\"toggleShowAssets\"],null],[29,\"hash\",null,[[\"aria-label\"],[\"show assets\"]]]]],{\"statements\":[],\"parameters\":[]},null],[0,\"\\n\"]],\"parameters\":[]}],[0,\"                \"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[0,\"Add Files to Use\"],[10],[0,\"\\n              \"],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"isRoot\"]]],null,{\"statements\":[[0,\"              \"],[7,\"div\"],[11,\"class\",\"tooltip\"],[9],[0,\"\\n                \"],[7,\"div\"],[11,\"class\",\"dropdown\"],[9],[0,\"\\n                  \"],[4,\"bs-button\",null,[[\"id\",\"class\",\"icon\",\"onClick\",\"__HTML_ATTRIBUTES__\"],[\"add-library-btn\",\"clear-btn transport-btn\",\"glyphicon glyphicon-briefcase\",[29,\"action\",[[24,0,[]],\"toggleLibraryDropdown\"],null],[29,\"hash\",null,[[\"aria-label\"],[\"add library\"]]]]],{\"statements\":[],\"parameters\":[]},null],[0,\"\\n                 \"],[7,\"div\"],[11,\"id\",\"myDropdown\"],[11,\"class\",\"dropdown-content\"],[9],[0,\"\\n\"],[4,\"each\",[[25,[\"libraries\"]]],null,{\"statements\":[[0,\"                    \"],[4,\"bs-button\",null,[[\"class\",\"onClick\"],[\"library-btn\",[29,\"action\",[[24,0,[]],\"insertLibrary\",[24,2,[]]],null]]],{\"statements\":[[1,[24,2,[\"title\"]],false]],\"parameters\":[]},null],[0,\"\\n\"]],\"parameters\":[2]},null],[0,\"                 \"],[10],[0,\"\\n                \"],[10],[0,\"\\n                \"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[0,\"Add libraries\"],[10],[0,\"\\n              \"],[10],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[]},null],[0,\"            \"],[7,\"div\"],[11,\"class\",\"tooltip\"],[9],[0,\"\\n\"],[4,\"if\",[[25,[\"showSettings\"]]],null,{\"statements\":[[0,\"                \"],[4,\"bs-button\",null,[[\"id\",\"class\",\"icon\",\"onClick\",\"__HTML_ATTRIBUTES__\"],[\"settings-btn\",\"clear-btn transport-btn\",\"glyphicon glyphicon-chevron-up\",[29,\"action\",[[24,0,[]],\"toggleShowSettings\"],null],[29,\"hash\",null,[[\"aria-label\"],[\"hide settings\"]]]]],{\"statements\":[],\"parameters\":[]},null],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"                \"],[4,\"bs-button\",null,[[\"id\",\"class\",\"icon\",\"onClick\",\"__HTML_ATTRIBUTES__\"],[\"settings-btn\",\"clear-btn transport-btn\",\"glyphicon glyphicon-cog\",[29,\"action\",[[24,0,[]],\"toggleShowSettings\"],null],[29,\"hash\",null,[[\"aria-label\"],[\"show settings\"]]]]],{\"statements\":[],\"parameters\":[]},null],[0,\"\\n\"]],\"parameters\":[]}],[0,\"              \"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[0,\"Show Document Settings\"],[10],[0,\"\\n            \"],[10],[0,\"\\n            \"],[7,\"div\"],[11,\"class\",\"tooltip\"],[9],[0,\"\\n\"],[4,\"if\",[[25,[\"showRecordingPanel\"]]],null,{\"statements\":[[0,\"                \"],[4,\"bs-button\",null,[[\"class\",\"icon\",\"onClick\",\"__HTML_ATTRIBUTES__\"],[\"clear-btn transport-btn\",\"glyphicon glyphicon-chevron-up\",[29,\"action\",[[24,0,[]],\"toggleShowRecordingPanel\"],null],[29,\"hash\",null,[[\"aria-label\"],[\"hide Recording\"]]]]],{\"statements\":[],\"parameters\":[]},null],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"                \"],[4,\"bs-button\",null,[[\"class\",\"icon\",\"onClick\",\"__HTML_ATTRIBUTES__\"],[\"clear-btn transport-btn\",\"glyphicon glyphicon-record\",[29,\"action\",[[24,0,[]],\"toggleShowRecordingPanel\"],null],[29,\"hash\",null,[[\"aria-label\"],[\"show Recording\"]]]]],{\"statements\":[],\"parameters\":[]},null],[0,\"\\n\"]],\"parameters\":[]}],[0,\"              \"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[0,\"Recording Options\"],[10],[0,\"\\n            \"],[10],[0,\"\\n            \"],[7,\"div\"],[11,\"class\",\"tooltip col-2\"],[9],[0,\"\\n              \"],[1,[29,\"download-button\",null,[[\"doc\"],[[25,[\"parentData\"]]]]],false],[0,\"\\n              \"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[0,\"Download Project as Zip\"],[10],[0,\"\\n            \"],[10],[0,\"\\n            \"],[7,\"div\"],[11,\"class\",\"tooltip col-2\"],[9],[0,\"\\n              \"],[4,\"bs-button\",null,[[\"style\",\"icon\",\"class\",\"onClick\",\"__HTML_ATTRIBUTES__\"],[\"font-size:16pt;\",\"glyphicon glyphicon-fullscreen\",\"clear-btn transport-btn\",[29,\"action\",[[24,0,[]],\"enterFullscreen\"],null],[29,\"hash\",null,[[\"aria-label\"],[\"full screen\"]]]]],{\"statements\":[],\"parameters\":[]},null],[0,\"\\n              \"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[0,\"Enter Fullscreen\"],[10],[0,\"\\n            \"],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"isOwner\"]]],null,{\"statements\":[[0,\"              \"],[7,\"div\"],[11,\"class\",\"tooltip col-2\"],[9],[0,\"\\n                \"],[4,\"bs-button\",null,[[\"icon\",\"id\",\"class\",\"onClick\",\"__HTML_ATTRIBUTES__\"],[\"glyphicon glyphicon-remove\",\"code-delete-btn\",\"clear-btn transport-btn\",[29,\"action\",[[24,0,[]],\"deleteDoc\"],null],[29,\"hash\",null,[[\"aria-label\"],[\"delete document\"]]]]],{\"statements\":[],\"parameters\":[]},null],[0,\"\\n                \"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[0,\"Delete Document\"],[10],[0,\"\\n              \"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"          \"],[10],[0,\"\\n    \"],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[7,\"div\"],[11,\"class\",\"tooltip\"],[11,\"style\",\"float:right;padding-top:18px;padding-right:18px;\"],[9],[0,\"\\n        \"],[4,\"bs-button\",null,[[\"icon\",\"id\",\"class\",\"onClick\",\"__HTML_ATTRIBUTES__\"],[\"glyphicon glyphicon-play\",\"mobile-play-btn\",\"clear-btn floated-right\",[29,\"action\",[[24,0,[]],\"playOrPause\"],null],[29,\"hash\",null,[[\"aria-label\"],[\"render code\"]]]]],{\"statements\":[],\"parameters\":[]},null],[0,\"\\n        \"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[0,\"Render Code\"],[10],[0,\"\\n      \"],[10],[0,\"\\n\"]],\"parameters\":[]}],[0,\"  \"],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"showShare\"]]],null,{\"statements\":[[0,\"  \"],[7,\"div\"],[11,\"id\",\"share-container\"],[9],[0,\"\\n    \"],[7,\"p\"],[9],[0,\"Editable Link : \"],[1,[23,\"editLink\"],false],[10],[0,\"\\n    \"],[7,\"p\"],[9],[0,\"Embed Link : \"],[1,[23,\"embedLink\"],false],[10],[0,\"\\n  \"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"showRecordingPanel\"]]],null,{\"statements\":[[0,\"  \"],[7,\"div\"],[11,\"id\",\"recording-panel-container\"],[9],[0,\"\\n    \"],[1,[29,\"recording-panel\",null,[[\"possibleNodes\",\"options\",\"onOptionsChanged\"],[[25,[\"possibleRecordingNodes\"]],[25,[\"recordingOptions\"]],[29,\"action\",[[24,0,[]],\"onRecordingOptionsChanged\"],null]]]],false],[0,\"\\n  \"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"showSettings\"]]],null,{\"statements\":[[0,\"  \"],[7,\"div\"],[11,\"id\",\"settings-container\"],[9],[0,\"\\n\"],[4,\"if\",[[25,[\"session\",\"isAuthenticated\"]]],null,{\"statements\":[[0,\"      \"],[7,\"div\"],[11,\"class\",\"tooltip\"],[9],[0,\"\\n        \"],[4,\"bs-button\",null,[[\"tabIndex\",\"class\",\"onClick\",\"__HTML_ATTRIBUTES__\"],[\"0\",\"clear-text-btn\",[29,\"action\",[[24,0,[]],\"forkDocument\"],null],[29,\"hash\",null,[[\"aria-label\"],[\"fork document\"]]]]],{\"statements\":[[0,\"FORK\"]],\"parameters\":[]},null],[0,\"\\n        \"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[0,\"Make Your Own Copy\"],[10],[0,\"\\n      \"],[10],[0,\"\\n      \"],[7,\"div\"],[11,\"class\",\"tooltip\"],[9],[0,\"\\n        \"],[4,\"bs-button\",null,[[\"tabIndex\",\"class\",\"onClick\",\"__HTML_ATTRIBUTES__\"],[\"0\",\"clear-text-btn\",[29,\"action\",[[24,0,[]],\"flagDocument\"],null],[29,\"hash\",null,[[\"aria-label\"],[\"flag document\"]]]]],{\"statements\":[[0,\"FLAG\"]],\"parameters\":[]},null],[0,\"\\n        \"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[0,\"Report as Inappropriate\"],[10],[0,\"\\n      \"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"isOwner\"]]],null,{\"statements\":[[0,\"      \"],[7,\"div\"],[11,\"class\",\"tooltip\"],[9],[0,\"\\n        \"],[7,\"label\"],[11,\"class\",\"doc-checkbox\"],[11,\"for\",\"privacyCheckbox\"],[9],[0,\"PRIVATE\"],[10],[0,\"\\n        \"],[1,[29,\"input\",null,[[\"tabIndex\",\"type\",\"id\",\"checked\",\"click\"],[\"0\",\"checkbox\",\"privacyCheckbox\",[25,[\"model\",\"isPrivate\"]],[29,\"action\",[[24,0,[]],\"togglePrivacy\"],null]]]],false],[0,\"\\n        \"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[0,\"Other users can discover\"],[10],[0,\"\\n      \"],[10],[0,\"\\n      \"],[7,\"div\"],[11,\"class\",\"tooltip\"],[9],[0,\"\\n        \"],[7,\"label\"],[11,\"class\",\"doc-checkbox\"],[11,\"for\",\"readOnlyCheckbox\"],[9],[0,\"READ ONLY\"],[10],[0,\"\\n        \"],[1,[29,\"input\",null,[[\"type\",\"tabIndex\",\"id\",\"checked\",\"click\"],[\"checkbox\",\"0\",\"readOnlyCheckbox\",[25,[\"model\",\"readOnly\"]],[29,\"action\",[[24,0,[]],\"toggleReadOnly\"],null]]]],false],[0,\"\\n        \"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[0,\"WARNING! Other users can edit your code\"],[10],[0,\"\\n      \"],[10],[0,\"\\n      \"],[7,\"div\"],[11,\"class\",\"tooltip\"],[9],[0,\"\\n        \"],[7,\"label\"],[11,\"class\",\"doc-checkbox\"],[11,\"for\",\"playCheckbox\"],[9],[0,\"DONT PLAY ON OPEN\"],[10],[0,\"\\n        \"],[1,[29,\"input\",null,[[\"tabIndex\",\"type\",\"checked\",\"click\"],[\"0\",\"checkbox\",[25,[\"model\",\"dontPlay\"]],[29,\"action\",[[24,0,[]],\"toggleDontPlay\"],null]]]],false],[0,\"\\n        \"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[0,\"Dont play on open\"],[10],[0,\"\\n      \"],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"colabMode\"]]],null,{\"statements\":[[0,\"      \"],[7,\"div\"],[11,\"class\",\"tooltip\"],[9],[0,\"\\n        \"],[7,\"label\"],[11,\"class\",\"doc-checkbox\"],[11,\"id\",\"colab-checkbox\"],[11,\"for\",\"colabCheckbox\"],[9],[0,\"COLLABORATIVE?\"],[10],[0,\"\\n        \"],[1,[29,\"input\",null,[[\"tabIndex\",\"type\",\"checked\",\"click\"],[\"0\",\"checkbox\",[25,[\"model\",\"isCollaborative\"]],[29,\"action\",[[24,0,[]],\"toggleCollaborative\"],null]]]],false],[0,\"\\n        \"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[0,\"COLLABORATIVE EDITTING\"],[10],[0,\"\\n      \"],[10],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[]},null],[4,\"if\",[[25,[\"canEditSource\"]]],null,{\"statements\":[[0,\"      \"],[7,\"div\"],[11,\"class\",\"tooltip\"],[9],[0,\"\\n        \"],[7,\"label\"],[11,\"class\",\"doc-checkbox\"],[11,\"for\",\"autoRenderCheckbox\"],[9],[0,\"AUTO RENDER\"],[10],[0,\"\\n        \"],[1,[29,\"input\",null,[[\"tabIndex\",\"type\",\"id\",\"checked\",\"click\"],[\"0\",\"checkbox\",\"autoRenderCheckbox\",[25,[\"autoRender\"]],[29,\"action\",[[24,0,[]],\"toggleAutoRender\"],null]]]],false],[0,\"\\n        \"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[0,\"Render Code Whilst Typing\"],[10],[0,\"\\n      \"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"  \"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"showAssets\"]]],null,{\"statements\":[[0,\"    \"],[7,\"div\"],[11,\"class\",\"file-upload-container\"],[9],[0,\"\\n         \"],[7,\"div\"],[11,\"id\",\"uploaded-assets-container\"],[9],[0,\"\\n\"],[4,\"each\",[[25,[\"model\",\"assets\"]]],null,{\"statements\":[[0,\"            \"],[7,\"div\"],[11,\"class\",\"asset-container\"],[9],[0,\"\\n              \"],[7,\"p\"],[11,\"class\",\"file-text file-name\"],[9],[1,[24,1,[\"name\"]],false],[10],[0,\"\\n              \"],[4,\"bs-button\",null,[[\"tabIndex\",\"class\",\"icon\",\"onClick\",\"__HTML_ATTRIBUTES__\"],[\"0\",\"clear-btn file-btn\",\"glyphicon glyphicon-remove\",[29,\"action\",[[24,0,[]],\"deleteAsset\",[24,1,[\"name\"]]],null],[29,\"hash\",null,[[\"aria-label\"],[\"delete asset\"]]]]],{\"statements\":[],\"parameters\":[]},null],[0,\"\\n              \"],[4,\"bs-button\",null,[[\"tabIndex\",\"class\",\"icon\",\"onClick\",\"__HTML_ATTRIBUTES__\"],[\"0\",\"clear-btn file-btn\",\"glyphicon glyphicon-eye-open\",[29,\"action\",[[24,0,[]],\"previewAsset\",[24,1,[]]],null],[29,\"hash\",null,[[\"aria-label\"],[\"preview asset\"]]]]],{\"statements\":[],\"parameters\":[]},null],[0,\"\\n            \"],[10],[0,\"\\n\"]],\"parameters\":[1]},null],[0,\"        \"],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"canEditSource\"]]],null,{\"statements\":[[0,\"      \"],[7,\"div\"],[11,\"id\",\"asset-progress\"],[9],[10],[0,\"\\n      \"],[7,\"div\"],[11,\"class\",\"file-upload\"],[9],[0,\"\\n        \"],[1,[29,\"file-upload\",null,[[\"multiple\",\"onProgress\",\"onCompletion\",\"onAllCompletion\",\"onError\"],[true,[29,\"action\",[[24,0,[]],\"assetProgress\"],null],[29,\"action\",[[24,0,[]],\"assetUploaded\"],null],[29,\"action\",[[24,0,[]],\"assetUploadingComplete\"],null],[29,\"action\",[[24,0,[]],\"assetError\"],null]]]],false],[0,\"\\n      \"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"    \"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"mediaQueries\",\"isDesktop\"]]],null,{\"statements\":[[4,\"if\",[[25,[\"showSettings\"]]],null,{\"statements\":[[4,\"if\",[[25,[\"model\",\"isCollaborative\"]]],null,{\"statements\":[[4,\"if\",[[25,[\"canEditSettings\"]]],null,{\"statements\":[[0,\"          \"],[1,[29,\"tokenfield-input\",null,[[\"elementId\",\"tokens\",\"allowDuplicates\",\"placeholder\",\"editable\",\"searchTag\",\"tokensChanged\",\"inputToggled\"],[\"collaborators\",[25,[\"model\",\"collaborators\"]],false,\"Enter Collaborators\",[25,[\"canEditSettings\"]],[29,\"action\",[[24,0,[]],\"searchCollaborator\"],null],[29,\"action\",[[24,0,[]],\"collaboratorsChanged\"],null],[29,\"action\",[[24,0,[]],\"syncOutputContainer\"],null]]]],false],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[]},null]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[1,[29,\"tokenfield-input\",null,[[\"tokens\",\"elementId\",\"allowDuplicates\",\"placeholder\",\"editable\",\"searchTag\",\"tokensChanged\",\"inputToggled\"],[[25,[\"model\",\"tags\"]],\"tags\",false,\"Enter Tags\",[25,[\"canEditSettings\"]],[29,\"action\",[[24,0,[]],\"searchTag\"],null],[29,\"action\",[[24,0,[]],\"tagsChanged\"],null],[29,\"action\",[[24,0,[]],\"syncOutputContainer\"],null]]]],false],[0,\"\\n\"]],\"parameters\":[]}]],\"parameters\":[]},null]],\"parameters\":[]}],[0,\"  \"],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"mediaQueries\",\"isDesktop\"]]],null,{\"statements\":[[0,\"      \"],[1,[29,\"project-tabs\",null,[[\"parent\",\"tabs\",\"onSelect\",\"onDelete\",\"onCreate\"],[[25,[\"parentData\"]],[25,[\"tabs\"]],[29,\"action\",[[24,0,[]],\"tabSelected\"],null],[29,\"action\",[[24,0,[]],\"tabDeleted\"],null],[29,\"action\",[[24,0,[]],\"newTab\"],null]]]],false],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"  \"],[10],[0,\"\\n  \"],[7,\"main\"],[9],[0,\"\\n    \"],[7,\"div\"],[11,\"id\",\"fullscreen\"],[9],[0,\"\\n    \"],[7,\"div\"],[11,\"id\",\"main-code-container\"],[9],[0,\"\\n\"],[4,\"if\",[[25,[\"showHUD\"]]],null,{\"statements\":[[0,\"        \"],[1,[29,\"loading-hud\",null,[[\"message\",\"hideWheel\"],[[25,[\"hudMessage\"]],[25,[\"isEmbedded\"]]]]],false],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"isEmbeddedWithCode\"]]],null,{\"statements\":[[0,\"      \"],[7,\"div\"],[11,\"id\",\"embedded-run-container\"],[9],[0,\"\\n\"],[4,\"bs-button\",null,[[\"class\",\"id\",\"icon\",\"onClick\",\"__HTML_ATTRIBUTES__\"],[\"clear-text-btn embedded-menu-button\",\"embedded-run-button\",\"glyphicon glyphicon-play\",[29,\"action\",[[24,0,[]],\"playOrPause\"],null],[29,\"hash\",null,[[\"aria-label\"],[\"play or pause\"]]]]],{\"statements\":[],\"parameters\":[]},null],[4,\"if\",[[25,[\"isShowingCode\"]]],null,{\"statements\":[[0,\"        \"],[4,\"bs-button\",null,[[\"class\",\"onClick\",\"__HTML_ATTRIBUTES__\"],[\"clear-text-btn embedded-menu-button\",[29,\"action\",[[24,0,[]],\"hideCode\"],null],[29,\"hash\",null,[[\"aria-label\"],[\"hide code\"]]]]],{\"statements\":[[0,\"Hide Code\\n\"]],\"parameters\":[]},null]],\"parameters\":[]},{\"statements\":[[0,\"        \"],[4,\"bs-button\",null,[[\"class\",\"onClick\",\"__HTML_ATTRIBUTES__\"],[\"clear-text-btn embedded-menu-button\",[29,\"action\",[[24,0,[]],\"showCode\"],null],[29,\"hash\",null,[[\"aria-label\"],[\"show code\"]]]]],{\"statements\":[[0,\"Show Code\\n\"]],\"parameters\":[]},null]],\"parameters\":[]}],[0,\"      \"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"isMobile\"]]],null,{\"statements\":[[0,\"          \"],[7,\"span\"],[9],[7,\"strong\"],[9],[0,\"SUPORT FOR MOBILES IS LIMITED\"],[10],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[25,[\"showCodeControls\"]]],null,{\"statements\":[[0,\"        \"],[7,\"div\"],[11,\"id\",\"drag-container\"],[9],[0,\"\\n\"],[4,\"if\",[[25,[\"isShowingCode\"]]],null,{\"statements\":[[0,\"            \"],[4,\"bs-button\",null,[[\"class\",\"icon\",\"onClick\",\"__HTML_ATTRIBUTES__\"],[\"hide-code-btn\",\"glyphicon glyphicon-menu-right\",[29,\"action\",[[24,0,[]],\"hideCode\"],null],[29,\"hash\",null,[[\"aria-label\"],[\"hide code\"]]]]],{\"statements\":[],\"parameters\":[]},null],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"            \"],[4,\"bs-button\",null,[[\"class\",\"icon\",\"onClick\",\"__HTML_ATTRIBUTES__\"],[\"hide-code-btn\",\"glyphicon glyphicon-menu-left\",[29,\"action\",[[24,0,[]],\"showCode\"],null],[29,\"hash\",null,[[\"aria-label\"],[\"show code\"]]]]],{\"statements\":[],\"parameters\":[]},null],[0,\"\\n\"]],\"parameters\":[]}],[0,\"          \"],[7,\"div\"],[11,\"id\",\"drag-button\"],[12,\"onmousedown\",[29,\"action\",[[24,0,[]],\"mouseDown\"],null]],[12,\"onmouseup\",[29,\"action\",[[24,0,[]],\"mouseUp\"],null]],[12,\"onmousemove\",[29,\"action\",[[24,0,[]],\"mouseMove\"],null]],[9],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"isShowingCode\"]]],null,{\"statements\":[[4,\"if\",[[25,[\"isEmbeddedWithCode\"]]],null,{\"statements\":[[0,\"            \"],[7,\"div\"],[9],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"            \"],[7,\"div\"],[11,\"id\",\"playback-container\"],[9],[0,\"\\n              \"],[2,\" <p class = \\\"side-menu-label\\\">code</p> \"],[0,\"\\n              \"],[7,\"div\"],[11,\"class\",\"tooltip\"],[9],[0,\"\\n                \"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[0,\"Play / Pause program\"],[10],[0,\"\\n\"],[4,\"bs-button\",null,[[\"class\",\"id\",\"icon\",\"onClick\",\"__HTML_ATTRIBUTES__\"],[\"clear-btn\",\"embedded-run-button\",\"glyphicon glyphicon-play\",[29,\"action\",[[24,0,[]],\"playOrPause\"],null],[29,\"hash\",null,[[\"aria-label\"],[\"play or pause\"]]]]],{\"statements\":[],\"parameters\":[]},null],[0,\"            \"],[10],[0,\"\\n              \"],[2,\" {{ops-player\\n                onSkip = (action 'skipOp')\\n                onPlay = (action 'playOps')\\n                onRewind = (action 'rewindOps')\\n                onPause = (action 'pauseOps')\\n                isPlaying = isPlayingOps\\n              }} \"],[0,\"\\n              \"],[7,\"div\"],[11,\"class\",\"tooltip\"],[9],[0,\"\\n                \"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[0,\"Bigger Font\"],[10],[0,\"\\n\"],[4,\"bs-button\",null,[[\"class\",\"icon\",\"onClick\"],[\"clear-btn\",\"glyphicon glyphicon-zoom-in\",[29,\"action\",[[24,0,[]],\"zoomIn\"],null]]],{\"statements\":[],\"parameters\":[]},null],[0,\"              \"],[10],[0,\"\\n              \"],[7,\"div\"],[11,\"class\",\"tooltip\"],[9],[0,\"\\n                \"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[0,\"Smaller Font\"],[10],[0,\"\\n\"],[4,\"bs-button\",null,[[\"class\",\"icon\",\"onClick\"],[\"clear-btn\",\"glyphicon glyphicon-zoom-out\",[29,\"action\",[[24,0,[]],\"zoomOut\"],null]]],{\"statements\":[],\"parameters\":[]},null],[0,\"              \"],[10],[0,\"\\n              \"],[7,\"div\"],[11,\"class\",\"tooltip\"],[9],[0,\"\\n                \"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[0,\"Toggle Contrast\"],[10],[0,\"\\n\"],[4,\"bs-button\",null,[[\"class\",\"icon\",\"onClick\"],[\"clear-btn\",\"glyphicon glyphicon-text-background\",[29,\"action\",[[24,0,[]],\"toggleHighContrast\"],null]]],{\"statements\":[],\"parameters\":[]},null],[0,\"              \"],[10],[0,\"\\n            \"],[10],[0,\"\\n\"]],\"parameters\":[]}]],\"parameters\":[]},null],[0,\"          \"],[10],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[]}],[0,\"\\n        \"],[7,\"div\"],[11,\"id\",\"ace-container\"],[12,\"style\",[23,\"aceStyle\"]],[12,\"onmouseup\",[29,\"action\",[[24,0,[]],\"mouseUp\"],null]],[12,\"onmousemove\",[29,\"action\",[[24,0,[]],\"mouseMove\"],null]],[9],[0,\"\\n\"],[4,\"if\",[[25,[\"isEmbeddedWithCode\"]]],null,{\"statements\":[[0,\"            \"],[7,\"div\"],[9],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[25,[\"showReadOnly\"]]],null,{\"statements\":[[4,\"if\",[[25,[\"isShowingCode\"]]],null,{\"statements\":[[0,\"              \"],[7,\"div\"],[11,\"class\",\"code-warning-overlay\"],[11,\"id\",\"read-only-overlay\"],[9],[0,\"\\n                \"],[7,\"p\"],[11,\"id\",\"read-only-text\"],[9],[0,\"This document is read only, logged in users can fork to edit their own version\"],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"session\",\"isAuthenticated\"]]],null,{\"statements\":[[4,\"bs-button\",null,[[\"class\",\"id\",\"onClick\",\"__HTML_ATTRIBUTES__\"],[\"clear-text-btn\",\"read-only-fork-button\",[29,\"action\",[[24,0,[]],\"forkDocument\"],null],[29,\"hash\",null,[[\"aria-label\"],[\"fork document\"]]]]],{\"statements\":[[0,\"                    Fork\\n\"]],\"parameters\":[]},null]],\"parameters\":[]},null],[0,\"              \"],[10],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[]},null]],\"parameters\":[]}],[4,\"if\",[[25,[\"showConnectionWarning\"]]],null,{\"statements\":[[0,\"            \"],[7,\"div\"],[11,\"class\",\"code-warning-overlay\"],[11,\"id\",\"connection-warning-container\"],[9],[0,\"\\n                 \"],[7,\"p\"],[11,\"id\",\"connection-warning-text\"],[9],[0,\" \"],[1,[23,\"connectionWarning\"],false],[10],[0,\"\\n            \"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"\\n          \"],[1,[29,\"code-mirror\",null,[[\"onReady\",\"onChange\",\"onReevaluate\",\"suggestCompletions\"],[[29,\"action\",[[24,0,[]],\"onEditorReady\"],null],[29,\"action\",[[24,0,[]],\"onSessionChange\"],null],[29,\"action\",[[24,0,[]],\"onReevaluate\"],null],[29,\"action\",[[24,0,[]],\"suggestCompletions\"],null]]]],false],[0,\"\\n          \"],[10],[0,\"\\n      \"],[10],[0,\"\\n      \"],[2,\" if this is in the main-output-container, strange things happen with anchor links in chrome ¯\\\\_(ツ)_/¯ \"],[0,\"\\n      \"],[7,\"div\"],[11,\"id\",\"output-container\"],[12,\"onmouseup\",[29,\"action\",[[24,0,[]],\"mouseUp\"],null]],[12,\"onmousemove\",[29,\"action\",[[24,0,[]],\"mouseMove\"],null]],[9],[0,\"\\n        \"],[7,\"iframe\"],[11,\"title\",\"output-frame\"],[11,\"id\",\"output-iframe\"],[11,\"srcdoc\",\"\"],[11,\"frameBorder\",\"0\"],[12,\"name\",[23,\"iframeTitle\"]],[9],[10],[0,\"\\n      \"],[10],[0,\"\\n    \"],[10],[0,\"\\n    \"],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"isMobile\"]]],null,{\"statements\":[[0,\"        \"],[7,\"div\"],[9],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[25,[\"isEmbedded\"]]],null,{\"statements\":[[0,\"          \"],[7,\"div\"],[9],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"          \"],[7,\"textarea\"],[11,\"readonly\",\"\"],[11,\"id\",\"console\"],[11,\"rows\",\"5\"],[11,\"wrap\",\"hard\"],[11,\"maxlength\",\"500\"],[9],[1,[23,\"consoleOutput\"],false],[10],[0,\"          \"],[7,\"label\"],[11,\"style\",\"color:transparent;\"],[11,\"for\",\"console\"],[9],[0,\"output console\"],[10],[0,\"\\n\"]],\"parameters\":[]}]],\"parameters\":[]}],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/code-editor.hbs" } });
});
;define("ember-share-db/templates/components/about-description", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "b5Tdvjk7", "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"id\",\"about-overlay-title\"],[9],[0,\"\\n  \"],[7,\"p\"],[11,\"id\",\"about-overlay-title-text\"],[9],[0,\"\\n  Make Music and Art \"],[7,\"br\"],[9],[10],[0,\"with Machine Intelligence\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"mediaQueries\",\"isXs\"]]],null,{\"statements\":[[7,\"div\"],[9],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[7,\"div\"],[11,\"id\",\"about-overlay-desc\"],[9],[0,\"\\n  \"],[7,\"p\"],[11,\"id\",\"about-overlay-desc-text\"],[9],[0,\"\\n    The mimic project offers a way to make\\n     new kinds of music, sound and creative\\n     arts experiences using machine learning,\\n     machine listening and artificial\\n     intelligence.\\n  \"],[10],[0,\"\\n  \"],[7,\"div\"],[11,\"id\",\"getting-started-container\"],[9],[0,\"\\n  \"],[7,\"a\"],[11,\"id\",\"getting-started-link\"],[12,\"href\",[23,\"docURL\"]],[9],[0,\" Getting Started → \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"parameters\":[]}]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/about-description.hbs" } });
});
;define("ember-share-db/templates/components/audio-classifier-guide", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "3nZN117J", "block": "{\"symbols\":[],\"statements\":[[7,\"h1\"],[9],[0,\" Audio Triggers Project \"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  Here we use the onser detector from Nick Collin's MMLL.js to try and build a percussive sound classifier to mix some music tracks. We use a window around the onset for each example in your dataset, recording the spectral centroid. If you find the onset detector is trggering too much or not enough, use the threshold slider at the bottom to adjust.\\n\"],[10],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"width\",\"height\"],[\"585ecea5-4841-6ae5-a8c1-4a0ddb8975fd\",\"250px\",\"850px\"]]],false],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/audio-classifier-guide.hbs" } });
});
;define("ember-share-db/templates/components/autopilot-guide", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "OoXphg8v", "block": "{\"symbols\":[],\"statements\":[[7,\"h1\"],[9],[0,\"Linear Regression Model to Generate Drone Sound\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThe perceptual features of drone sound involve sustaining yet ever-changing sonic textures. Such an effect can be achieved by mixing different audio components together and continuously modulating the harmonics of them. If we use a synthesiser to produce these audio components, there will be many parameters involved in the modulation in order to obtain interesting musical dynamics, in fact, too many for a lazy noise maker like me!\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nSo, since we know linear regression models can produce continuous data based on a few given discrete data points, why not use one to generate continuous control signals for all the parameters of a synthesiser? This way lazy noise makers just need to decide a few discrete parametric points as well as how the sound would traverse around these points, then the model will do all the calculations!\\n\"],[10],[0,\"\\n\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"width\",\"height\"],[\"37bd95c1-c1ff-a09a-55eb-eb8cc4884e88\",\"250px\",\"650px\"]]],false],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nNow, you see there are two panels in the UI, the upper one is for the synthesiser while the lower one is for the linear regression model. Let’s get our lazy hands on it:\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\\n\"],[7,\"ol\"],[9],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"\\n    Hit Record to tell the model to start waiting to capture and record any discrete data points to be later fed into it. You will see what these data points represent in the following steps\\n  \"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"\\n     Hit Randomise to generate a random sound, you will see the synthesiser’s parameter values change accordingly. You can adjust the parameters manually or hit Randomise again until you find a sound you like as one of the ‘anchor sounds’ for your drone sound.\\n  \"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"\\n    Hit somewhere on the blue Pad, as the ‘anchor position’, to map the ‘anchor sound’ to. This way the ‘anchor sound’ and the ‘anchor position’ are bound together making up an ‘anchor data point’, which is now captured and recorded by the linear regression model as the discrete datapoint it needs to produce continuous signals with.\\n  \"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"\\n    However lazy you might be, a few more ‘anchor points’ are needed. So, repeat step 2-3 a couple of times.\\n  \"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"\\n    Hit Stop then Train, the model creates a continuous space based on the ‘anchor points’ you gave it. This space joins all the ‘anchor sounds’ and ‘anchor positions’ together with interpolation and extrapolation. The space is your playground ready, but you can’t hear it or see it unless you fly through it.\\n  \"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"\\n    Juicy part! Move your mouse on to the blue Pad and hold down the button, imagine like holding a drone, slowly steer it over the Pad. You should be able to hear the sound changes following your movement. In other words, the movement in a spatial continuum is transformed to the sound changing in a sonic continuum.\\n  \"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"\\n    Release the mouse button, your movement will be recorded and repeatedly played back and forth to control the ‘drone’. Lazy noise makingaccomplished!\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/autopilot-guide.hbs" } });
});
;define("ember-share-db/templates/components/base-token", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "A4rF/48L", "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"role\",\"button\"],[11,\"tabIndex\",\"0\"],[11,\"class\",\"uncharted-token-label\"],[9],[1,[23,\"token\"],false],[0,\"\\n\"],[4,\"if\",[[25,[\"canDelete\"]]],null,{\"statements\":[[4,\"bs-button\",null,[[\"role\",\"tabIndex\",\"class\",\"onClick\",\"icon\"],[\"button\",\"0\",\"tag-delete-btn\",[29,\"action\",[[24,0,[]],\"onDelete\"],null],\"glyphicon glyphicon-remove\"]],{\"statements\":[],\"parameters\":[]},null]],\"parameters\":[]},null],[3,\"action\",[[24,0,[]],\"selectToken\"]],[10],[0,\"\\n\"],[7,\"div\"],[11,\"class\",\"uncharted-token-actions\"],[9],[0,\"\\n    \"],[7,\"span\"],[11,\"class\",\"fa fa-times uncharted-remove-action\"],[9],[3,\"action\",[[24,0,[]],\"removeToken\"]],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/base-token.hbs" } });
});
;define("ember-share-db/templates/components/bbcut-guide", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "Uw7NpxIr", "block": "{\"symbols\":[],\"statements\":[[7,\"h1\"],[9],[0,\" BBCut Break Chopping Library \"],[10],[0,\"\\n\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"width\",\"height\"],[\"50568259-fd05-e122-aa39-d3e39e39a6c0\",\"250px\",\"850px\"]]],false],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/bbcut-guide.hbs" } });
});
;define("ember-share-db/templates/components/code-mirror", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "fyeqYsE4", "block": "{\"symbols\":[],\"statements\":[[7,\"textarea\"],[11,\"id\",\"code-mirror-container\"],[9],[0,\"\\n\"],[10],[0,\"\"],[7,\"label\"],[11,\"style\",\"color:transparent;\"],[11,\"for\",\"code-mirror-container\"],[9],[0,\"code editor\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/code-mirror.hbs" } });
});
;define("ember-share-db/templates/components/colab-guide", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "tjm1bZ9X", "block": "{\"symbols\":[],\"statements\":[[7,\"video\"],[11,\"width\",\"800\"],[11,\"height\",\"680\"],[11,\"controls\",\"\"],[9],[0,\"\\n \"],[7,\"source\"],[12,\"src\",[29,\"concat\",[[25,[\"url\"]],\"/images/colab_scaled.mp4\"],null]],[11,\"type\",\"video/mp4\"],[9],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"br\"],[9],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nMIMIC documents now allow for \"],[7,\"strong\"],[9],[0,\"Collaborative Editing\"],[10],[0,\". This means multiple users can edit a document simultaneously in \"],[7,\"strong\"],[9],[0,\"real time, changing and re-evaluating code on the fly\"],[10],[0,\".\\n\"],[10],[0,\"\\n\"],[7,\"br\"],[9],[10],[0,\"\\n\"],[7,\"h3\"],[9],[0,\"Adding Collaborators\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nYou can add collaborators to one of your documents by going to Settings (cog in the top menu bar), ticking “Collaborative”, then adding the username of anyone you want to collaborate.\\n\"],[10],[0,\"\\n\"],[7,\"br\"],[9],[10],[0,\"\\n\"],[7,\"img\"],[12,\"src\",[29,\"concat\",[[25,[\"url\"]],\"/images/add_colab.gif\"],null]],[9],[10],[0,\"\\n\"],[7,\"br\"],[9],[10],[0,\"\\n\"],[7,\"br\"],[9],[10],[0,\"\\n\"],[7,\"h3\"],[9],[0,\"Realtime updates\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nYou will now see each others changes in real time! As one user updates their document on the left, the changes are automatically updated onto another collaborators document on the right in real time.\\n\"],[10],[0,\"\\n\"],[7,\"br\"],[9],[10],[0,\"\\n\"],[7,\"img\"],[12,\"src\",[29,\"concat\",[[25,[\"url\"]],\"/images/two_codes.gif\"],null]],[9],[10],[0,\"\\n\"],[7,\"br\"],[9],[10],[0,\"\\n\"],[7,\"h3\"],[9],[0,\"Re-evaluating Code\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nYou will also receive each others re-evaluations of code on the fly (Cmd+enter/Ctrl+Enter). Great for Live Code jamming.\\n\"],[10],[0,\"\\n\"],[7,\"br\"],[9],[10],[0,\"\\n\"],[7,\"br\"],[9],[10],[0,\"\\n\"],[7,\"img\"],[12,\"src\",[29,\"concat\",[[25,[\"url\"]],\"/images/edit.gif\"],null]],[9],[10],[0,\"\\n\"],[7,\"br\"],[9],[10],[0,\"\\n\"],[7,\"br\"],[9],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/colab-guide.hbs" } });
});
;define("ember-share-db/templates/components/conceptular-guide", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "j/LdLhCS", "block": "{\"symbols\":[],\"statements\":[[7,\"h1\"],[9],[0,\" New Neural Network Approach to Synthesis \"],[10],[0,\"\\n\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"width\",\"height\"],[\"83b58e5e-487f-fd88-158e-239d85202bce\",\"250px\",\"850px\"]]],false],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/conceptular-guide.hbs" } });
});
;define("ember-share-db/templates/components/data-col", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "ZNplNMpp", "block": "{\"symbols\":[],\"statements\":[[4,\"if\",[[25,[\"_property\",\"component\"]]],null,{\"statements\":[[0,\"  \"],[1,[29,\"component\",[[25,[\"_property\",\"component\"]]],[[\"value\",\"object\",\"propertyPath\",\"properties\"],[[25,[\"value\"]],[25,[\"item\"]],[25,[\"property\",\"key\"]],[25,[\"_property\",\"componentProperties\"]]]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"  \"],[1,[23,\"value\"],false],[0,\"\\n\"]],\"parameters\":[]}]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/data-col.hbs" } });
});
;define("ember-share-db/templates/components/document-list-item", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "AxqXbpBd", "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"class\",\"col-sm-12 col-md-6 document-list-col\"],[9],[0,\"\\n\\n\"],[7,\"div\"],[11,\"class\",\"document-list-item\"],[9],[0,\"\\n\"],[7,\"div\"],[11,\"class\",\"doc-list-name-container\"],[9],[0,\"\\n  \"],[4,\"link-to\",[\"code-editor\",[25,[\"document\",\"documentId\"]]],[[\"class\"],[\"document-link\"]],{\"statements\":[[1,[25,[\"document\",\"name\"]],false],[0,\"  \"]],\"parameters\":[]},null],[0,\"\\n  \"],[7,\"p\"],[11,\"class\",\"doc-by-label\"],[9],[0,\"by \"],[10],[0,\"\\n\"],[4,\"link-to\",[\"documents\",[25,[\"document\",\"owner\"]],0,\"views\"],[[\"class\"],[\"document-name-link\"]],{\"statements\":[[0,\"  \"],[1,[25,[\"document\",\"owner\"]],false]],\"parameters\":[]},null],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"div\"],[11,\"class\",\"tooltip doc-item-tooltip\"],[9],[0,\"...\\n\"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[1,[25,[\"document\",\"name\"]],false],[0,\" by \"],[1,[25,[\"document\",\"owner\"]],false],[0,\" \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"div\"],[11,\"class\",\"doc-list-icon-container\"],[9],[0,\"\\n\"],[4,\"if\",[[25,[\"document\",\"readOnly\"]]],null,{\"statements\":[[0,\"  \"],[7,\"div\"],[11,\"class\",\"tooltip\"],[9],[0,\"\\n    \"],[7,\"span\"],[11,\"class\",\"glyphicon glyphicon-lock doc-item-icon readonly-doc-icon\"],[11,\"aria-hidden\",\"true\"],[9],[10],[0,\"\\n    \"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[0,\"Read Only\"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"document\",\"isPrivate\"]]],null,{\"statements\":[[0,\"  \"],[7,\"div\"],[11,\"class\",\"tooltip\"],[9],[0,\"\\n    \"],[7,\"span\"],[11,\"class\",\"glyphicon glyphicon-eye-close doc-item-icon private-doc-icon\"],[11,\"aria-hidden\",\"true\"],[9],[10],[0,\"\\n    \"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[0,\"Private\"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"canEdit\"]]],null,{\"statements\":[[0,\"    \"],[7,\"div\"],[11,\"class\",\"tooltip\"],[9],[0,\"\\n      \"],[7,\"span\"],[11,\"class\",\"glyphicon glyphicon-play\"],[11,\"aria-hidden\",\"true\"],[9],[10],[0,\"\\n      \"],[1,[29,\"input\",null,[[\"role\",\"type\",\"checked\",\"click\"],[\"checkbox\",\"checkbox\",[25,[\"doPlay\"]],[29,\"action\",[[24,0,[]],\"toggleDontPlay\"],null]]]],false],[0,\"\\n      \"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[0,\"Play on Open\"],[10],[0,\"\\n    \"],[10],[0,\"\\n\"],[4,\"bs-button\",null,[[\"class\",\"tabIndex\",\"icon\",\"onClick\"],[\"main-delete-button\",\"0\",\"glyphicon glyphicon-trash\",[29,\"action\",[[24,0,[]],\"delete\"],null]]],{\"statements\":[],\"parameters\":[]},null]],\"parameters\":[]},null],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/document-list-item.hbs" } });
});
;define("ember-share-db/templates/components/download-button", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "OksWQnMq", "block": "{\"symbols\":[],\"statements\":[[4,\"bs-button\",null,[[\"class\",\"icon\",\"onClick\",\"__HTML_ATTRIBUTES__\"],[\"download-button clear-btn transport-btn\",\"glyphicon glyphicon-download-alt\",[29,\"action\",[[24,0,[]],\"download\"],null],[29,\"hash\",null,[[\"aria-label\"],[\"download document\"]]]]],{\"statements\":[],\"parameters\":[]},null],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/download-button.hbs" } });
});
;define("ember-share-db/templates/components/embedded-project", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "f9Ok0RWs", "block": "{\"symbols\":[],\"statements\":[[4,\"if\",[[25,[\"manualLoad\"]]],null,{\"statements\":[[0,\"  \"],[7,\"div\"],[11,\"class\",\"load-project-btn\"],[12,\"style\",[30,[\"top:\",[23,\"buttonTop\"]]]],[9],[0,\"\\n  \"],[4,\"bs-button\",null,[[\"class\",\"onClick\",\"__HTML_ATTRIBUTES__\"],[\"load-project-btn\",[29,\"action\",[[24,0,[]],\"loadProject\"],null],[29,\"hash\",null,[[\"aria-label\"],[\"show assets\"]]]]],{\"statements\":[[0,\"Start Demo\"]],\"parameters\":[]},null],[0,\"\\n  \"],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[25,[\"loaded\"]]],null,{\"statements\":[[0,\"    \"],[7,\"div\"],[9],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"    \"],[7,\"h1\"],[9],[0,\"Loading...\"],[10],[0,\"\\n\"]],\"parameters\":[]}]],\"parameters\":[]}],[7,\"iframe\"],[11,\"class\",\"embedded-tutorial-code\"],[12,\"src\",[23,\"srcURL\"]],[11,\"allow\",\"microphone\"],[11,\"scrolling\",\"no\"],[12,\"style\",[30,[\"width: 100%; height: \",[23,\"height\"],\"; overflow: hidden;\"]]],[9],[0,\"what?\"],[10],[0,\"\\n\"],[7,\"a\"],[11,\"class\",\"embedded-link\"],[12,\"href\",[29,\"concat\",[[25,[\"url\"]],\"/code/\",[25,[\"docId\"]]],null]],[9],[0,\"Go To Project\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/embedded-project.hbs" } });
});
;define('ember-share-db/templates/components/ember-popper-targeting-parent', ['exports', 'ember-popper/templates/components/ember-popper-targeting-parent'], function (exports, _emberPopperTargetingParent) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _emberPopperTargetingParent.default;
    }
  });
});
;define('ember-share-db/templates/components/ember-popper', ['exports', 'ember-popper/templates/components/ember-popper'], function (exports, _emberPopper) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _emberPopper.default;
    }
  });
});
;define("ember-share-db/templates/components/evolib-example-guide", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "LV25kyvN", "block": "{\"symbols\":[],\"statements\":[[7,\"h1\"],[9],[0,\" Evolve Your Own Sounds \"],[10],[0,\"\\n\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"width\",\"height\"],[\"3e67cfd2-c171-5bf1-db4c-a5b0cde68e7e\",\"250px\",\"800px\"]]],false],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/evolib-example-guide.hbs" } });
});
;define("ember-share-db/templates/components/evolib-guide", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "TuGeJklN", "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nHow about using a machine intelligence technique to help us to program a modular synthesizer? In this guide, we'll show you how.\\n\"],[10],[0,\"\\n\"],[7,\"h2\"],[9],[0,\"\\nIntroduction\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nA lot of recent machine learning systems that you may have read about use things called deep neural networks to do creative things like writing music, generating images and so on. But there are many other techniques used to allow computers to do seemingly smart things. One of these is called a genetic algorithm. With genetic algorithms, we can actually breed things inside a computer, just like we might breed new varieties of crops or animals. The idea is to work with a small population of things (in this case, sounds) which we are going breed and mutate until we are satisfied with the results.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nIn this example, we are going to use a genetic algorithm to breed virtual modular synthesizer patches. We have created a simple Javascript library for you called Evolib that makes this possible.\\n\"],[10],[0,\"\\n\"],[7,\"h2\"],[9],[0,\"\\nPart 1: getting started - make a sound\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nLet's get started by creating a random synthesizer patch, then we'll find out how to improve it through selective breeding.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nHere is some starter code which just pulls in the evolib library. You'll need to upload evolib.js as a file asset:\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\n<!DOCTYPE html>\\n<html>\\n<head>\\n  <script src=\\\"evolib.js\\\"></script>\\n</head>\\n<body>\\n</body>\\n</html>\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nNow we are ready to tell evolib to make some sounds. Put this code in the body tag somewhere - this creates a new population of 5 sounds, each sound has 30 modules. The modules might be oscillators or filters, and can be wired to eachother in different ways. The modules and wiring starts off totally random.\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"  \"],[7,\"code\"],[9],[0,\"\\n<script language=\\\"javascript\\\" type=\\\"text/javascript\\\">\\nEvolib.newPopulation(5, 30); // 5 sounds, 30 modules each\\n</script>\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nNow we want to listen to our sounds.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nWeb browsers don't let us play any sound unless the user has clicked on something first. To listen to one of the sounds then, we need to add a button and tell it what to do when they click it.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nAdd this to the body tag:\\n\\n\"],[7,\"pre\"],[9],[0,\"  \"],[7,\"code\"],[9],[0,\"\\n<button onclick=\\\"Evolib.play(0)\\\">Listen to sound 0</button>\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nNow how about another button to stop the sound?\\n\"],[10],[0,\"\\n\\n\"],[7,\"pre\"],[9],[0,\"  \"],[7,\"code\"],[9],[0,\"\\n<button onclick=\\\"Evolib.stop(0)\\\">Stop the sound</button>\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nSometimes, the sounds are silent. Imagine if you randomly wired up 30 randomly selected oscillators and filters - would it always make a sound? Let's add another button that let's us generate a new random sound easily so we can keep pressing it until we get a decent sound.\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"  \"],[7,\"code\"],[9],[0,\"\\n<button onclick=\\\"Evolib.newPopulation(5, 30);  Evolib.play(0)\\\">new sound</button>\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nNote that this button generates a new population, then plays the first sound.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nHere is the complete code so far\\n\"],[10],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"height\"],[\"a990f234-5769-c556-b49a-0154204a016a\",\"400px\"]]],false],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"h2\"],[9],[0,\"\\nPart 2: mutate the sound\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nNow we have some neat sounds, we are going to start using evolutionary computation to mutate them. Let's get straight to mutating sounds, then we'll think about what is going on.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nAdd this to your set of buttons:\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"  \"],[7,\"code\"],[9],[0,\"\\n  <button\\n   onclick=\\\"Evolib.evolve([0], 0.1);Evolib.play(0)\\\">\\n     mutate\\n  </button>\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nTry clicking the new sound button until you get a decent sound. Then click on mutate repeatedly, and you should hear the sound changing slightly. This is the sound being mutated.\\n\\nThe important code here is the call to Evolib.evolve:\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"  \"],[7,\"code\"],[9],[0,\"\\nEvolib.evolve([0], 0.1);\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nIt takes two arguments - the first is a list of numbers (in this case, just 0) which are the sounds we want to 'evolve'. The second is the mutation rate. The higher the mutation rate, the more the sound will change each time you mutate it.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThe power of genetic algorithms lies in the fact that they represent the things you are evolving in a form that can be mutated, and even crossed with other things. This is very similar to how plants and animals are described in their DNA and changing the DNA changes the plant or the animal.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThe DNA of an evolib sound is a list of numbers, like this: 0.5, 0.125, 0.255 etc. One number might say what kind of module it is (< 0.5? its a filter. >= 0.5? its an oscillator). Another number might set up the initial state of the module, e.g. the filter cutoff frequency (0-5000Hz). Other numbers describe how that module should be wired to other modules, by specifying a connection range.\\n\"],[10],[0,\"\\n\"],[7,\"h2\"],[9],[0,\"\\nPart 3: selecting sounds for breeding\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nSo far, we have only been working with a single sound and mutating it. Now we are going to get access to a population of sounds, so we can choose which mutant we want to breed from.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nTry adding some more play buttons to the program, so your play buttons look like this:\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"  \"],[7,\"code\"],[9],[0,\"\\n  <button onclick=\\\"Evolib.play(0)\\\"br>play 1</buttonbr>\\n<br>\\n  <button onclick=\\\"Evolib.play(1)\\\"br>play 1</buttonbr>\\n<brbr>\\n  <button onclick=\\\"Evolib.play(2)\\\"br>play 1</buttonbr>\\n<brbr>\\n  <button onclick=\\\"Evolib.play(3)\\\"br>play 2</buttonbr>\\n<brbr>\\n  <button onclick=\\\"Evolib.play(4)\\\"br>play 3</buttonbr>\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nNow you can listen to all 5 sounds in the population. Try clicking the buttons. You will hear that they all sound different. That is because they are all random sounds.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nNow let's add buttons which allow us to choose which sound we want to create the next population from, for example this one selects sound 1 for mutation:\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"  \"],[7,\"code\"],[9],[0,\"\\n  <button onclick=\\\"Evolib.play(1)\\\"br>play 1</buttonbr>\\n  <button onclick=\\\"Evolib.evolve([1], 0.1);Evolib.play(0)\\\"br>mutate</buttonbr>\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nYou'll end up with something like this, which shows the full set of buttons:\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"  \"],[7,\"code\"],[9],[0,\"\\n  <button onclick=\\\"Evolib.play(0)\\\"br>play 0</buttonbr>\\n  <button onclick=\\\"Evolib.evolve([0], 0.1);Evolib.play(0)\\\">mutate</buttonbr>\\n  <brbr>\\n  <button onclick=\\\"Evolib.play(1)\\\">play 1</buttonbr>\\n  <button onclick=\\\"Evolib.evolve([1], 0.1);Evolib.play(0)\\\">mutate</buttonbr>\\n  <brbr>\\n  <button onclick=\\\"Evolib.play(2)\\\">play 2</buttonbr>\\n  <button onclick=\\\"Evolib.evolve([2], 0.1);Evolib.play(0)\\\">mutate</buttonbr>\\n  <brbr>\\n  <button onclick=\\\"Evolib.play(3)\\\">play 3</buttonbr>\\n  <button onclick=\\\"Evolib.evolve([3], 0.1);Evolib.play(0)\\\">mutate</buttonbr>\\n  <brbr>\\n  <button onclick=\\\"Evolib.play(4)\\\">play 4</buttonbr>\\n    <button onclick=\\\"Evolib.evolve([4], 0.1);Evolib.play(0)\\\">mutate</buttonbr>\\n<brbr>\\n  <brbr>\\n  <button onclick=\\\"Evolib.stop()\\\">stop</buttonbr>\\n  <button onclick=\\\"Evolib.newPopulation(5, 30);  Evolib.play(0)\\\">new sounds</buttonbr>\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nNow you can click on the mutate button to select which of the sounds you want. After clicking mutate, click on the play buttons to hear mutations of the sound you selected for mutation. Keep going and you'll gradually breed a set of sounds. If they change too little, increase the mutation rate:\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"  \"],[7,\"code\"],[9],[0,\"\\nEvolib.evolve([0], 0.2); // 0.2 is a higher mutation rate\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nHere is the complete code:\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[1,[29,\"embedded-project\",null,[[\"docId\",\"height\"],[\"723f4078-b9c2-de8d-4970-fb41609213e2\",\"400px\"]]],false],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"h2\"],[9],[0,\"\\nNext part:\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nIn the next part, we'll look at how to add a record button, how to gain more control of the evolutionary process and how to change the characteristics of the available modules.\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/evolib-guide.hbs" } });
});
;define("ember-share-db/templates/components/example-tile", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "Mij1nbjX", "block": "{\"symbols\":[\"tag\"],\"statements\":[[7,\"div\"],[11,\"role\",\"button\"],[11,\"tabIndex\",\"0\"],[11,\"class\",\"example-tile-container-outer col-xs-12 col-sm-12\"],[12,\"onclick\",[29,\"action\",[[24,0,[]],\"onClick\"],null]],[12,\"onmouseover\",[29,\"action\",[[24,0,[]],\"onover\"],null]],[12,\"onmouseout\",[29,\"action\",[[24,0,[]],\"onout\"],null]],[12,\"onkeypress\",[29,\"action\",[[24,0,[]],\"onClick\"],null]],[9],[0,\"\\n  \"],[7,\"div\"],[11,\"class\",\"example-tile-container\"],[12,\"id\",[23,\"colourId\"]],[9],[0,\"\\n    \"],[7,\"table\"],[9],[0,\"\\n        \"],[7,\"caption\"],[11,\"style\",\"padding:0px;color:inherit;\"],[9],[7,\"p\"],[11,\"class\",\"example-tile-title\"],[12,\"id\",[23,\"colourId\"]],[9],[1,[23,\"name\"],false],[10],[10],[0,\"\\n        \"],[7,\"td\"],[9],[0,\"\\n          \"],[7,\"div\"],[11,\"class\",\"example-desc-container\"],[12,\"id\",[23,\"colourId\"]],[9],[0,\"\\n\"],[4,\"each\",[[25,[\"tags\"]]],null,{\"statements\":[[0,\"              \"],[7,\"p\"],[11,\"class\",\"example-tile-tag\"],[9],[1,[24,1,[]],false],[10],[0,\"\\n\"]],\"parameters\":[1]},null],[0,\"          \"],[10],[0,\"\\n          \"],[7,\"div\"],[11,\"class\",\"example-color\"],[12,\"id\",[23,\"colourId\"]],[9],[0,\"\\n            \"],[1,[29,\"shape-cell\",null,[[\"isSelected\",\"colourId\"],[[25,[\"isSelected\"]],[25,[\"colourId\"]]]]],false],[0,\"\\n          \"],[10],[0,\"\\n        \"],[10],[0,\"\\n        \"],[7,\"td\"],[9],[0,\"\\n          \"],[7,\"p\"],[11,\"class\",\"example-desc-text\"],[9],[1,[23,\"description\"],false],[10],[0,\"\\n      \"],[10],[0,\"\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/example-tile.hbs" } });
});
;define("ember-share-db/templates/components/face-synth-guide", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "SflEAbZA", "block": "{\"symbols\":[],\"statements\":[[7,\"h1\"],[9],[0,\" Control This Granular Synth With Your Emotions \"],[10],[0,\"\\n\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"width\",\"height\"],[\"9dc4eaf4-93db-26e8-9357-155eb152ea44\",\"250px\",\"800px\"]]],false],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/face-synth-guide.hbs" } });
});
;define("ember-share-db/templates/components/file-upload", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "jULV0LGV", "block": "{\"symbols\":[\"&default\"],\"statements\":[[15,1]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/file-upload.hbs" } });
});
;define("ember-share-db/templates/components/filter-item", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "NFgbfOFW", "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"role\",\"button\"],[11,\"tabIndex\",\"0\"],[12,\"class\",[29,\"concat\",[\"filter-item \",[25,[\"filter\",\"id\"]]],null]],[12,\"onkeypress\",[29,\"action\",[[24,0,[]],\"onFilter\"],null]],[12,\"onclick\",[29,\"action\",[[24,0,[]],\"onFilter\"],null]],[9],[0,\"\\n\"],[4,\"if\",[[25,[\"filter\",\"highlightTitle\"]]],null,{\"statements\":[[0,\"    \"],[7,\"p\"],[12,\"class\",[29,\"concat\",[\"filter-text filter-text-selected \",\"filter-text-\",[25,[\"filter\",\"id\"]]],null]],[9],[1,[25,[\"filter\",\"title\"]],false],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"    \"],[7,\"p\"],[12,\"class\",[29,\"concat\",[\"filter-text \",\"filter-text-\",[25,[\"filter\",\"id\"]]],null]],[9],[1,[25,[\"filter\",\"title\"]],false],[10],[0,\"\\n\"]],\"parameters\":[]}],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/filter-item.hbs" } });
});
;define("ember-share-db/templates/components/guide-tile", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "DWVzy765", "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"role\",\"button\"],[11,\"tabIndex\",\"0\"],[11,\"class\",\"example-tile-container-outer col-xs-12 col-sm-12\"],[12,\"onclick\",[29,\"action\",[[24,0,[]],\"onClick\"],null]],[12,\"onmouseover\",[29,\"action\",[[24,0,[]],\"onover\"],null]],[12,\"onmouseout\",[29,\"action\",[[24,0,[]],\"onout\"],null]],[12,\"onkeypress\",[29,\"action\",[[24,0,[]],\"onClick\"],null]],[9],[0,\"\\n  \"],[7,\"div\"],[11,\"class\",\"example-tile-container\"],[12,\"id\",[23,\"colourId\"]],[9],[0,\"\\n    \"],[7,\"table\"],[9],[0,\"\\n        \"],[7,\"caption\"],[11,\"style\",\"padding:0px;color:inherit;\"],[9],[7,\"p\"],[11,\"class\",\"example-tile-title\"],[12,\"id\",[23,\"colourId\"]],[9],[1,[23,\"name\"],false],[10],[10],[0,\"\\n        \"],[7,\"td\"],[9],[0,\"\\n          \"],[7,\"div\"],[11,\"class\",\"guide-author-container\"],[12,\"id\",[23,\"colourId\"]],[9],[0,\"\\n             by \"],[1,[23,\"author\"],false],[0,\"\\n          \"],[10],[0,\"\\n          \"],[7,\"div\"],[11,\"class\",\"example-color\"],[12,\"id\",[23,\"colourId\"]],[9],[0,\"\\n            \"],[1,[29,\"shape-cell\",null,[[\"isSelected\",\"colourId\"],[[25,[\"isSelected\"]],[25,[\"colourId\"]]]]],false],[0,\"\\n          \"],[10],[0,\"\\n        \"],[10],[0,\"\\n        \"],[7,\"td\"],[9],[0,\"\\n          \"],[7,\"p\"],[11,\"class\",\"guide-desc-text\"],[9],[1,[23,\"description\"],false],[10],[0,\"\\n      \"],[10],[0,\"\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/guide-tile.hbs" } });
});
;define("ember-share-db/templates/components/kadenze-guide", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "ybS6VvPL", "block": "{\"symbols\":[],\"statements\":[[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nRebecca Fiebrink, a key part of the MIMIC team, runs the excellent Kadenze course Machine Learning for Musicians and Artists. It provides a ton of learning resources and is designed to teach machine learning in a way that will be useful to creative pracitioners.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThroughout the videos, Rebecca demonstrates machine learning concepts mainly using the Wekinator software, however, in this guide we will provide resources that can allow for follow up work to be completed on the MIMIC platform using the RapidLib machine learning library. Following each Session (~45 mins of videos, depending on how fast you make Rebecca speak), we will provide a set of tasks to help you explore and cement the concepts covered.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nYou can sign up for the course \"],[7,\"a\"],[11,\"href\",\"https://www.kadenze.com/courses/machine-learning-for-musicians-and-artists/info\"],[9],[0,\"here\"],[10],[0,\". The course is free if you do not require a certificate to finish or graded projects, and can be started at any time, and completed at any pace.\\n\"],[10],[0,\"\\n\"],[7,\"h2\"],[11,\"id\",\"maxiaudio\"],[9],[0,\"Part 1: Introduction\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nTo follow through with this we recommend first watching the \"],[7,\"a\"],[11,\"href\",\"https://www.kadenze.com/courses/machine-learning-for-musicians-and-artists-v/sessions/introduction\"],[9],[0,\"Session 1: Introduction videos\"],[10],[0,\". After watching these videos you should be familiar with these concepts:\\n  \"],[7,\"ul\"],[9],[0,\"\\n    \"],[7,\"li\"],[9],[0,\" Supervised learning uses examples to train models \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\" The supervised learning algorithms that will be covered in the course can be broadly grouped into three classes: Classification, Regression and Temporal Analysis\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\" Rebecca introduces Wekinator as a tool to do machine learning, and OSC as a way to transfer data in and out. In this guide we will be using RapidLib to do the machine learning and using various javascript libraries and funcationality to get control data from sliders, the mouse and keyboard and other places, and then also generating sound using the Web Audio API and the maximilian.js library\"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  For this first part we are just going to get comfortable with using RapidLib to take an input, in this case the mouse, and record alongside some output. We will then train a model and use this to map 2 dimensional mouse input to control 4 synthesis parameters.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[1,[29,\"embedded-project\",null,[[\"docId\",\"height\"],[\"8de3cbbe-b7c6-d79f-65fa-42fd1aa43a26\",\"880px\"]]],false],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  Use the example below to randomise synth parameters until you find a sound you like. Move the mouse to somewhere on the screen, then click and hold to record samples. Then find more sounds and place them elsewhere on the screen and record again. When you have a few, hit \\\"t\\\" to train. Now when you move the mouse around you will be able to explore your newly trained sound space!\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  Try clearing the dataset (\\\"x\\\"), changing the training examples to see how this changes the behaviour of the system after it is re-trained. Spend some time experimenting with the trained models to start to understand how the models are changed.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  ASIDE: You can complete this whole project largely using the embedded examples, however, if you want to take a closer look at the code you can check out how to use RapidLib \"],[7,\"a\"],[12,\"href\",[29,\"concat\",[[25,[\"url\"]],\"/guides/RAPIDMIX\"],null]],[9],[0,\"here\"],[10],[0,\". It has an incredibly simple API.\\n\"],[10],[0,\"\\n\"],[7,\"h2\"],[9],[0,\" Part 2: Classification, I \"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  To follow through with this we recommend first watching the \"],[7,\"a\"],[11,\"href\",\"https://www.kadenze.com/courses/machine-learning-for-musicians-and-artists-v/sessions/classification-part-i\"],[9],[0,\"Session 2: Classification, Part I videos \"],[10],[0,\". After watching these videos, you shoud be familiar with the following concepts. We will then build on  these with some explorative tasks.\\n  \"],[7,\"ul\"],[9],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"When you have lots of features, or the relationship between your inputs and your outputs is complex, classification algorithms can allow you to build things that would be challenging or impossible to program yourself by hand.\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"Two approaches to classification problems shown were decision stumps and nearest neighbour. Although Wekinator provides a choice of algorithms for classification, RapidLib currently only implements K-Nearest Neighbour. \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"When deciding on an approach to take, we compared algorithm's sensitivity to noise and their capacity to learn complexity. Often this choice can be a payoff between the two.\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"To evaluate a model, we can test it on new inputs ourselves, or we can investigate its decision boundary. The tasks below will explore this further, allowing you to provide data and see the decision boundaries that are made.\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"To improve a model, we can try and provide more data, or better data, or we can change the features that we use. We should aim to pick features that are relavant to phenomena we are trying to model.\"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  Having given you a brief feel for how machine learning can allow you to map inputs, such as a mouse, to control an output, such as synthesis parameters, we will now examine how by incrementally building up our own datasets, we can sculpt the decision boundaries in classification tasks.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  In the videos Rebecca used a program called the Classification Explorer. Below is a version of this to use on the MIMIC platform. In order to input training examples, hold down a number key (e.g. 1) and move the mouse (you may have to click inside the example first to bring it into focus). This will input examples of that class as long as you are holding down that number key. The decision boundary will then be displayed.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[1,[29,\"embedded-project\",null,[[\"docId\"],[\"7f92bd4e-6d2b-181c-559f-4add766f2095\"]]],false],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  Try to choose a set of training examples that will draw the boundary on screen, with Class 1 on the left in green and Class 2 on the right in purple.\\n\"],[10],[0,\"\\n\"],[7,\"img\"],[12,\"src\",[29,\"concat\",[[25,[\"url\"]],\"/images/decision1.png\"],null]],[11,\"style\",\"width:400px;height:400px;\"],[9],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  Keep improving your boundary by changing your training examples, re-training, and re-drawing the decision boundary until you are happy with how it looks. If you need to start again, just pause and play the example.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  When actually making classifiers for a specific purpose, how close you need the decision boundary to match will depend on your intentions. We realise that it may not be possible, or even desirable, for it to be perfect!\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  Now try to make this decision boundary, with Class 1 in green and Class 2 in purple. This one is harder and you will not be able to make it perfectly using the K-Nearest Neighbour algorithm implemented in RapidLib. Thinking back to the videos, what do you think it is about the KNN algorithm that makes this decision boundary hard to implement? Which other algorithms do think would work better? Have you had to manufacture examples close to the decision boundary to make it fit the shape? Reflect on how this might effect the make up of your datasets when working on an actual project, will it just consist of representative examples of thing you are modelling? It may be the case that it contains edge cases included to directly influence the behaviour of your trained model.\\n\"],[10],[0,\"\\n\"],[7,\"img\"],[12,\"src\",[29,\"concat\",[[25,[\"url\"]],\"/images/decision2.png\"],null]],[11,\"style\",\"width:400px;height:400px;\"],[9],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  ASIDE: If you want to use a different and output method than the mouse, feel free to fork the project and create your own dataset using RapidLib. Make sure you have two inputs and one output and your dataset has the structure [{input:[x1,x2], output:[y1]}]. Then retrain your model and run explorer.updateOutput() to see your new decision boundary.\\n\"],[10],[0,\"\\n\"],[7,\"h2\"],[9],[0,\"Part 3: Regression\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  To follow through with this we recommend first watching the \"],[7,\"a\"],[11,\"href\",\"https://www.kadenze.com/courses/machine-learning-for-musicians-and-artists-v/sessions/regression\"],[9],[0,\"Session 3: Regression videos\"],[10],[0,\". After watching these videos, you shoud be familiar with the following concepts.\\n  \"],[7,\"ul\"],[9],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"Regression models can be used to map continuous inputs.\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"As with Classification, different algorithms produce different types of lines or curves given the same data.\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"As such, its important to pick an algorithm that can model the appropriate complexity. As with Classification, there is currently no chocie of regression algorithm in Rapidlib. \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"Many to many mappings can allow to quickly build an expressive musical instrument. With this, you can design instruments that react to performer's movements or actions without directly having to consider the exact mathematical relationship between input and output.\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"Below, we will see how you can use regression to control 3 parameters of a granular synth with just 1 slider.\"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nIn the videos Rebecca used a program called the Regression Explorer. Below is a version of this to use on the MIMIC platform. In order to input training examples, click onto screen at any point. The X value denotes the input value, whereas the y value denotes the output value. You will then see the regression line drawn as you add values. Try to get a feel for what types of lines are capable and how they’re influenced by the training data.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[1,[29,\"embedded-project\",null,[[\"docId\"],[\"26ab5507-0d25-07eb-cb03-aaa93883765d\"]]],false],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nCreate a training dataset this way to produce the line below. Keep editing your data and/or algorithm until the regression line drawn by the Regression Explorer matches the one at right as closely as possible.\\n\"],[10],[0,\"\\n\"],[7,\"img\"],[12,\"src\",[29,\"concat\",[[25,[\"url\"]],\"/images/decision3.png\"],null]],[11,\"style\",\"width:400px;height:400px;\"],[9],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nNow, think about whether you might be able to create this same line using even fewer training examples. If you think it’s possible to create this line using fewer examples, delete your training dataset and give it a try!\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nAs with the Classification Explorer, feel free to fork the code use RapidLib yourself to use your own inputs and outputs. In this case you will need to have a dataset including one input and one output only.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nNow we are going to try and see if we can train a model with 3 outputs to behave consistently. Select an input (at least 1) from the examples below, and choose an output with EXACTLY 3 parameters. Below we have an example of using a slider as input to control a granular synthesiser (borrowed from \"],[7,\"a\"],[11,\"href\",\"http://www.zya.cc/granular\"],[9],[0,\"Zya\"],[10],[0,\") where the outputs of the regression model are the position in the soundfile, the release on the envelope of the grains and the density (how frequently a new grain is triggered).\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[1,[29,\"embedded-project\",null,[[\"docId\"],[\"5d67faaa-e4c3-771a-f824-fe5c5b978ab6\"]]],false],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nFirst, play around with the two parameters and click on different parts of the waveform, find some sounds you like. When you are ready to record, select the \\\"Record\\\" checkbox. From now on, whenever you play the synthesiser, your position in the sample, the release and density will be recorded, along with the input slider value. Record in some sounds you like, remembering to map each one to a different value on the input slider.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nWhen you are ready to play, select the \\\"Run\\\" checkbox. This will train your model with the recorded dataset and now all 3 synthesiser parameters will be controlled by just the one value from the input slider. Keep recording examples until you can reliably control the output.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nNext, train model to reliably access the following values. To clear your dataset, just pause and play the embedded code.\\n\"],[7,\"ul\"],[9],[0,\"\\n\"],[7,\"li\"],[9],[0,\"(0.0, 0.0, 0.0) (all models output 0 simultaneously)\"],[10],[0,\"\\n\"],[7,\"li\"],[9],[0,\"(1.0, 1.0, 1.0) (all models output 1 simultaneously)\"],[10],[0,\"\\n\"],[7,\"li\"],[9],[0,\"(0.5, 0.0, 1.0) (model 1 outputs 0.5, model 2 outputs 0, and model 3 outputs 1)\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"h2\"],[9],[0,\"Part 4: Classification II\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  To follow through with this we recommend first watching the \"],[7,\"a\"],[11,\"href\",\"https://www.kadenze.com/courses/machine-learning-for-musicians-and-artists-v/sessions/classification-part-ii\"],[9],[0,\"Session 4: Classification II videos\"],[10],[0,\". In these videos, Rebecca demonstrates how classification algorithms can be useful in creative contexts, how to evaluate your algorithms performance and make the appropriate corrective steps to improve this.\\n  \"],[7,\"ul\"],[9],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"Sometimes if your data is noisy, or the feature representation is not sufficient, you will not be able to create the right decision boundary. In this situation, you should consider providing more, or better, data.\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"Alternatively, if you are sure your data is correct, you may have to spend more time picking the algorithm that will be able to capture the complexity of the phenomena you are trying to model.\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"However, picking an overly complex model can lead to overfitting of data, meaning your model will not generalise well to new data not present in the training set.\"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  For this part we are going to revisit the Classification Explorer but this time we are going to experiment with more than 2 classes, as well as more complicated decision boundaries.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\"],[\"7f92bd4e-6d2b-181c-559f-4add766f2095\"]]],false],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  By adding new training data, try to recreate the decision boundary below using the Classification Explorer. As you are doing this, think about\\n  \"],[7,\"ul\"],[9],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"How the model improves (or not) as you add more examples.\"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"How well the shape of the decision boundary the algorithm seems to want to make matches the boundary you are trying to make.\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"img\"],[12,\"src\",[29,\"concat\",[[25,[\"url\"]],\"/images/decision5.png\"],null]],[11,\"style\",\"width:400px;height:400px;\"],[9],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  Think about how the challenge of classification changes when you start to include non-binary problems. Now try creating some different boundaries by changing your training data using 3 or more classes.\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/kadenze-guide.hbs" } });
});
;define("ember-share-db/templates/components/kick-classifier-guide", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "4vxsF5Kq", "block": "{\"symbols\":[],\"statements\":[[7,\"h1\"],[9],[0,\" Object Recognition Classification Example \"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThis exercise has an initial step where you build your own controller using machine learning! There are also some suggestions for further remixing the patch with your own musical ideas which you can work on if you're into coding. You can still do loads of fun stuff without coding if you want, or if you want to get into the code, you can do that also!\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nIf you want to learn abit more about the basics of \"],[7,\"strong\"],[9],[0,\"supervised learning\"],[10],[0,\", you can check out this \"],[7,\"a\"],[12,\"href\",[29,\"concat\",[[25,[\"guideUrl\"]],\"supervised-ml\"],null]],[9],[0,\"guide.\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  Here we use the MobileNet feature extractor to control this audio track with a model trained on objects you hold up to your webcam. Whenever a different object is recognised, we change the playback rate, or the pattern, of the kicks.\\n\"],[10],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"height\",\"manualLoad\"],[\"a4c91621-199c-65b5-e355-2aadfc27c33f\",\"500px\",false]]],false],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"h1\"],[9],[0,\"\\n    Building Your Own Classifier\\n  \"],[10],[0,\"\\n\"],[7,\"ol\"],[9],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[7,\"strong\"],[9],[0,\"Changing the class value manually: \"],[10],[0,\"Use the drop down menu labelled “Class:” at the top of the Learner.js controls to change the current class. You should hear the drum beat change. \"],[10],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[7,\"strong\"],[9],[0,\"Record a neutral pose: \"],[10],[0,\"Change the Class back to 0. Pick a neutral position (standing/sitting in the middle of the screen).\\n      \"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n      Press record, and after a 2 second delay, 2 seconds of this pose will be recorded into Class 0 of the dataset. When we are recording, everytime a new frame of video is analysed, we take those features (the input) and store them alongside the class label (in this case 0).\\n    \"],[10],[0,\"\\n      You can always hit the \\\"Mute\\\" button on the sampler if you need break from the music while you work on your classifier.\"],[10],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[7,\"strong\"],[9],[0,\"Pick some objects: \"],[10],[0,\"The MobileNet feature extractor is good at telling what different objects are in the picture. Pick 3 objects from around your desk that you can hold up to the camera. Remember, the model will have to learn to spot the differences between these objects so the more different they are, the better it will work.\"],[10],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[7,\"strong\"],[9],[0,\"Record examples of new objects: \"],[10],[0,\"For each object, change the Class dropdown to a new class BEFORE you press record. Then record in some examples of you holding up that object.\\n      \"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n      Record in a few 2-second runs, having more examples and more slight variations on each object will make your classifier more robust.\\n      \"],[10],[0,\"\\n      For example, you might want to record examples of an object in slightly different locations / positions / rotations.\"],[10],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[7,\"strong\"],[9],[0,\"Try out your model: \"],[10],[0,\"When you have examples of all three classes, press Train. This will train the model then automatically Run when it is done.\\n      \"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n      When the classifier is running, everytime a new frame of video is analysed, we take those features (the input) and run them through the classifier. It predicts which object it thinks you are holding and reacts accordingly\\n        \"],[10],[0,\"\\n    \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[7,\"h1\"],[9],[0,\"\\n  Editting the Code\\n\"],[10],[0,\"\\nAs well as choosing your own objects, you can also try changing the musical content of the patch, and how it responds to being in different classes. To edit the project, you must first Fork it (make your own copy) using the button at the top of the code window. Here's some ideas\\n\"],[7,\"ul\"],[9],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\" Change the samples\\n    \"],[7,\"ul\"],[9],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"\\n      You can upload your own samples using the “Add Files” menu (2nd from the left) in the title bar. You can now refer to them by their filename in project. You can now replace your new sounds into the code (lines 53-55)\\n    \"],[10],[10],[0,\"\\n  \"],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\" Change the patterns\\n    \"],[7,\"ul\"],[9],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"\\n      The main drum pattern is set around line 58. This is an array of starts, samples and velocities (optional). For more detail on how to define sequences, look at the MaxiInstrument.js documentation.\\n    \"],[10],[10],[0,\"\\n  \"],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\" Change the classes\\n    \"],[7,\"ul\"],[9],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"\\n      Currently, we change the rate of the kick drum in Class 1 and 2, and make a short repeating loop in Class 3. This happens in the learner.onOutput callback. You could choose to change the pattern instead, or different parameters. Each sample has a gain, rate, pan, start and end\\n    \"],[10],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/kick-classifier-guide.hbs" } });
});
;define("ember-share-db/templates/components/learner-guide", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "dGaSV0WP", "block": "{\"symbols\":[],\"statements\":[[7,\"h2\"],[9],[0,\"Learner.js\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThis is a quick walkthrough of how to use Learner.js on the MIMIC platform to quickly build your own simple machine learning tools.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nIf you would like to check out the JSDoc API documentation, or the look at the source code, see the links below.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"ul\"],[9],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      \"],[7,\"a\"],[11,\"href\",\"https://www.doc.gold.ac.uk/~lmcca002/Learner.html\"],[9],[0,\"Documentation\"],[10],[0,\"\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      \"],[7,\"a\"],[11,\"href\",\"https://github.com/Louismac/learnerjs\"],[9],[0,\"Github\"],[10],[0,\"\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nLearner.js provides an interface that allows you to easily record in examples of input and output pairings into a dataset that is saved locally in your browser. You can then train a model to respond with new outputs when you provide new inputs. Building from the smarts of \"],[7,\"a\"],[11,\"href\",\"https://www.doc.gold.ac.uk/eavi/rapidmixapi.com/index.php/documentation/javascript-documentation/\"],[9],[0,\"RapidLib\"],[10],[0,\", we take care of all the storage, threading and GUI needs and all you have to do is pick what you want to control with what!\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nIf you want to learn abit more about the basics of \"],[7,\"strong\"],[9],[0,\"supervised learning\"],[10],[0,\", you can check out this \"],[7,\"a\"],[12,\"href\",[29,\"concat\",[[25,[\"guideUrl\"]],\"supervised-ml\"],null]],[9],[0,\"guide.\"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\nA Simple Example\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nBefore we look at any code, we can first look at a simple example of a project that uses \"],[7,\"strong\"],[9],[0,\"Learner.js\"],[10],[0,\" to classify clicks from your mouse (x and y coordinates) into one of two possible groups. I know, exciting right?\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[7,\"ol\"],[9],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"First, we're going to provide the dataset. Select \"],[7,\"strong\"],[9],[0,\"Record\"],[10],[0,\".\"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"Now, click a few times in the \"],[7,\"strong\"],[9],[0,\"bottom left hand corner\"],[10],[0,\" of the blue rectangle. You should see the number of saved examples going up.\"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"Now we want to add in some example of the second class. To do this, change the \"],[7,\"strong\"],[9],[0,\"Class drop down\"],[10],[0,\" to 1.\"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"Click a few times in the \"],[7,\"strong\"],[9],[0,\"top right hand corner\"],[10],[0,\" of the blue rectangle. Again, you should see the number of saved examples going up.\"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"Stop \"],[7,\"strong\"],[9],[0,\"Recording\"],[10],[0,\" and click \"],[7,\"strong\"],[9],[0,\"Train\"],[10],[0,\". When the model is build, it will automatically start running the trained model. This means you can click anywhere in the blue rectangle, and it will tell you which class you are in. You've made a binary decision maker, with no coding!\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"height\",\"manualLoad\"],[\"3738a892-330f-15ae-673e-5cb38f25a8e8\",\"700px\",false]]],false],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\nLearning the Library\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  If you hit the \"],[7,\"strong\"],[9],[0,\"Show Code\"],[10],[0,\" button in the bottom right on the project above, you can see how its made. Its not a lot of code! The rest of this document will go through this code from the Learner.js library step by step and have you making amazing projects in no time.\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nYou can follow along looking at the code above, or select \"],[7,\"strong\"],[9],[0,\"Go To Project\"],[10],[0,\" (the big green button) to check out the project in a separate tab. Otherwise, you can make a new project from scratch and follow along that way.\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nYou can also follow along to more complex examples if you would like, for example, using body tracking or audio analysis! If you want to take on this challenge, you can find \"],[7,\"a\"],[11,\"href\",\"https://mimicproject.com/inputs\"],[9],[0,\"a bunch of fun inputs\"],[10],[0,\" here.\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\n1. Set up\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThe learner.js library lives on the Mimic website and the first thing we have to do is include the library in our document. You can add the following code to the HTML at the top of your project.\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\n<script src = \\\"https://mimicproject.com/libs/learner.v.0.2.js\\\"></script>\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nNow some Javascript! First thing we need to do is make an instance of the main Learner object and save it in a variable to refer to later.\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\nconst learner = new Learner();\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\n2.  Add GUI\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nIn order to get all the useful interfaces in our project, we need to tell Learner.js to make it, and attach it to an \"],[7,\"strong\"],[9],[0,\"existing HTML element in our project\"],[10],[0,\".\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  Here we attach the Learner.js interface to a \"],[7,\"code\"],[9],[0,\"div\"],[10],[0,\" element called \\\"dataset\\\" that we have included in our project.\\n\"],[10],[0,\"\\n\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\nlearner.addGUI(document.getElementById(\\\"dataset\\\"));\\n\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\n3. Add Model\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nYou can now specify a model to use. Each Learner object can only have \"],[7,\"strong\"],[9],[0,\"one type of model\"],[10],[0,\", so if you want to have \"],[7,\"strong\"],[9],[0,\"multiple models\"],[10],[0,\", you need to make \"],[7,\"strong\"],[9],[0,\"multiple Learner objects\"],[10],[0,\"!\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThe model we used in the example of is a \"],[7,\"strong\"],[9],[0,\"Classifier\"],[10],[0,\", in that it applies \"],[7,\"strong\"],[9],[0,\"discrete labels\"],[10],[0,\" to the inputs. Use the code below, specifying the number of classes you wish to discriminate between.\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\nlearner.addClassification(4)\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nFor regression (continuous values), use the code below, specifying the number of outputs you want to control.\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\nlearner.addRegression(3)\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\nTweaking your models\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nYou can also adjust a few parameters of your models by passing an options object. For Regression models, RapidLib uses a Neural Network and the three available parameters to this are below. If you don't know what these mean, don't worry, the defaults will do you fine.\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\nlearner.setModelOptions({\\n  numEpochs:1000, //defaults to 500\\n  numHiddenLayers:1, //defaults to 1\\n  numHiddenNodes:16 //defaults to 1\\n})\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nFor Classification, RapidLib uses a K Nearest Neighbour Model and the only parameter is the eponymous K.\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\nlearner.setModelOptions({\\n  k:5 //defaults to 1\\n})\\n\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\n4. Add data\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThe learner expects to receive examples that are paired input and output mappings. For example, you could add the x and y position of the mouse every time it is moved (the input), paired with the current colour of canvas object (the output).\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nIt is important to note that one piece of code (below) serves two purposes.\\n\"],[7,\"ul\"],[9],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"If you are \"],[7,\"strong\"],[9],[0,\"recording\"],[10],[0,\", every time you add a new example the pairing is stored in the dataset. To use the values of the Learner.js GUI (the regression sliders or classification dropdown) as output labels, you can call \\\"learner.y\\\"\"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"If you are \"],[7,\"strong\"],[9],[0,\"running\"],[10],[0,\", just the input is used and given to the model, which then provides a new output based on the data it has seen.\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nUse the code below to add and array of inputs and an array of outputs.\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\nconst whenYouReceiveNewInputs = (newInputs)=> {\\n  //Match inputs with output labels you have collected\\n  learner.newExample(newInputs, outputs);\\n}\\n\\n//OR//\\n\\nconst whenYouReceiveNewInputs = (newInputs)=> {\\n  //Use the current values of the GUI as output labels\\n  learner.newExample(newInputs, learner.y);\\n}\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\nWhere does my data get saved?\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nEach dataset is specific to a MIMIC documents, and your dataset will be saved in the browser's IndexedDB. This means that will persist beyond reruns of the project, refreshes of the page and closing of the browser window (in public mode). You will \"],[7,\"strong\"],[9],[0,\"lose\"],[10],[0,\" the data if you clear your cache, or if you close the window and you are in private / incognito mode.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\nDownloading and Loading Datasets\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nYou may wish to save your dataset to your local machine, or upload your current dataset to our servers, so that anyone who runs your project can train a model using your dataset. Luckily, you can do that.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nFirst you have to download the data. Just hit the \\\"Download Data\\\" button on the GUI and you will get a .json file with all your lovely data.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nYou can then upload this file as an asset to your project and load in the data when your project is run. As the set up of the learner object is aynchronous, you can use the onLoad() callback to load your data. See below how you pass the function to the Learner constructor, in which you load the data, then when that is done, train().\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\nconst learner = new Learner({onLoad:()=>{\\n  learner.loadTrainingData(\\\"myLearnerData.json\\\").then(()=> {\\n    learner.train()\\n  })\\n}})\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\nPro Tip for Timing Recordings\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nYou can also use the following functions to provide a count in to recording, this will delay the start of recording the given number of seconds after the \\\"record\\\" button has been pressed. You can also choose to limit recording time, again specifying a given number of seconds beforehand you want to record for before it is automatically shut off. Both default to 0.\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\nlearner.setCountIn(5)\\nlearner.setRecordLimit(5)\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\n5. Respond to outputs\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nFinally, you should specify a function the is called when an a new output value is available. Again this function serves two purposes with one piece of code.\\n\"],[7,\"ul\"],[9],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"When you are  \"],[7,\"strong\"],[9],[0,\"not running\"],[10],[0,\", this will be in response to the GUI (the dropdown or the sliders) changing. You can save these in a variable to use later, or if you need to access them they are saved in the learner.y variable.\"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"If you are  \"],[7,\"strong\"],[9],[0,\"running\"],[10],[0,\", this will be the models response to an input. \"],[10],[0,\"\\n\"],[10],[0,\"\\nThe function returns an array of output values. Obviously, you can do something more fun.\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\nlearner.onOutput = (data)=> {\\n  y = data;\\n});\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\nWeb Audio Outputs (MaxiInstruments)\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nWe have a complimentry set of synthesisers and samplers, backed by AudioWorklets to reduce interference between the machine learning and the audio. They are designed to easily combine with Learner.js and \"],[7,\"a\"],[11,\"href\",\"https://mimicproject.com/guides/maxi-instrument\"],[9],[0,\"you can learn about them\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\nExternal Outputs\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  You can use the examples below to output with MIDI control message or OSC messages to control music or visual programs locally (Max/MSP, Supercollider, openFrameworks, Processing, PD etc....)\\n\"],[7,\"ul\"],[9],[0,\"\\n\"],[7,\"li\"],[9],[7,\"a\"],[11,\"href\",\"https://mimicproject.com/code/034ea170-483e-229a-f0e2-837d76c721c0\"],[9],[0,\"MIDI example sketch \"],[10],[10],[0,\"This uses WebMidi to send the output values as control changes. Note WebMidi is curently only supported in Chrome. You can send to external devices or connect to your internal MIDI bus, \"],[7,\"a\"],[11,\"href\",\"https://help.ableton.com/hc/en-us/articles/209774225-How-to-setup-a-virtual-MIDI-bus\"],[9],[0,\"this is a good resource for how to do that\"],[10],[0,\". First refresh devices, then select your output source and channel from the dropdown.\\n\"],[7,\"li\"],[9],[7,\"a\"],[11,\"href\",\"https://mimicproject.com/code/247e4538-0366-b735-9052-0e875a96a140\"],[9],[0,\"OSC example sketch \"],[10],[10],[0,\" As you cannot OSC directly form a browser, this connects to a local Node.js program via webosckets then forwards the data out via OSC, where you can do with it what you will.\\n\"],[7,\"ol\"],[9],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"First, \"],[7,\"a\"],[11,\"href\",\"https://github.com/Louismac/osc-repeater\"],[9],[0,\"download the node program\"],[10],[0,\". \"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"Install \"],[7,\"a\"],[11,\"href\",\"http://(https//nodejs.org/en/download/)\"],[9],[0,\"node \"],[10],[0,\" if you dont have it on your laptop\"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"In the terminal (OSX) or command-prompt (windows), navigate (cd) to the folder you unzipped to code to and run\\n  \"],[7,\"pre\"],[9],[0,\"  \"],[7,\"code\"],[9],[0,\"\\n    npm install & node osc-repeater.js\\n  \"],[10],[0,\"\\n  \"],[10],[0,\"  \"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"This should now forward the outputs from MIMIC to the port you have specfied in the code (defaults to 57120).\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\n6. Now be free and make amazing projects!\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"You can find \"],[7,\"a\"],[11,\"href\",\"https://mimicproject.com/inputs\"],[9],[0,\"a bunch of fun inputs\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nYou can also see the source and instructions for running the library locally or in your own projects away from the MIMIC platform in \"],[7,\"a\"],[11,\"href\",\"https://github.com/Louismac/learnerjs\"],[9],[0,\"this repository\"],[10],[0,\". There are also \"],[7,\"a\"],[11,\"href\",\"https://www.doc.gold.ac.uk/~lmcca002/Learner.html\"],[9],[0,\"full API docs\"],[10],[0,\".\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/learner-guide.hbs" } });
});
;define("ember-share-db/templates/components/loading-hud", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "YU5aYSjc", "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"id\",\"loading-container\"],[9],[0,\"\\n  \"],[7,\"div\"],[11,\"id\",\"loading-inner-container\"],[9],[0,\"\\n\"],[4,\"if\",[[25,[\"hideWheel\"]]],null,{\"statements\":[[0,\"    \"],[7,\"div\"],[9],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[7,\"div\"],[11,\"class\",\"loading-wheel\"],[9],[10],[0,\"\\n\"]],\"parameters\":[]}],[0,\"    \"],[7,\"p\"],[11,\"id\",\"loading-label\"],[9],[1,[23,\"message\"],false],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/loading-hud.hbs" } });
});
;define("ember-share-db/templates/components/lyric-guide", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "yj5Pnlb5", "block": "{\"symbols\":[],\"statements\":[[7,\"h1\"],[9],[0,\" Explore How Word Relate to Each Other \"],[10],[0,\"\\n\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"width\",\"height\"],[\"66a88951-a7d6-cc9f-0d8b-b043e4b952b0\",\"250px\",\"800px\"]]],false],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/lyric-guide.hbs" } });
});
;define("ember-share-db/templates/components/magnet-guide", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "lFb+TI6L", "block": "{\"symbols\":[],\"statements\":[[7,\"h1\"],[9],[0,\" LSTM Modelling of Audio\"],[10],[0,\"\\n\"],[7,\"p\"],[9],[0,\"Currently only working in Chrome\"],[10],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"width\",\"height\"],[\"84bf177b-af84-85c3-4933-32076561aca0\",\"250px\",\"700px\"]]],false],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/magnet-guide.hbs" } });
});
;define("ember-share-db/templates/components/main-navigation", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "d6sX3dzl", "block": "{\"symbols\":[\"nav\",\"dd\",\"ddm\",\"doc\",\"dd\",\"ddm\",\"dd\",\"ddm\",\"dd\",\"ddm\",\"dd\",\"ddm\"],\"statements\":[[7,\"div\"],[11,\"id\",\"mimic-navbar\"],[11,\"class\",\"limited-width-container\"],[9],[0,\"\\n\"],[7,\"img\"],[12,\"src\",[23,\"logoURL\"]],[11,\"alt\",\"main logo\"],[11,\"id\",\"main-logo\"],[9],[10],[0,\"\\n\"],[4,\"bs-nav\",null,[[\"type\"],[\"pills\"]],{\"statements\":[[4,\"if\",[[25,[\"mediaQueries\",\"isBurger\"]]],null,{\"statements\":[[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,1,[\"dropdown\"]],\"expected `nav.dropdown` to be a contextual component but found a string. Did you mean `(component nav.dropdown)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L5:C5) \"],null]],null,{\"statements\":[[0,\"    \"],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,11,[\"toggle\"]],\"expected `dd.toggle` to be a contextual component but found a string. Did you mean `(component dd.toggle)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L6:C7) \"],null]],[[\"class\"],[\"nav-dropdown burger-btn\"]],{\"statements\":[[0,\" ≡ \"],[7,\"span\"],[11,\"class\",\"caret\"],[9],[10]],\"parameters\":[]},null],[0,\"\\n\"],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,11,[\"menu\"]],\"expected `dd.menu` to be a contextual component but found a string. Did you mean `(component dd.menu)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L7:C7) \"],null]],null,{\"statements\":[[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,12,[\"item\"]],\"expected `ddm.item` to be a contextual component but found a string. Did you mean `(component ddm.item)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L8:C9) \"],null]],null,{\"statements\":[[0,\"      \"],[7,\"a\"],[12,\"href\",[29,\"concat\",[[25,[\"url\"]],\"/about\"],null]],[11,\"class\",\"nav-button dropdown-item\"],[9],[0,\"about\"],[3,\"action\",[[24,0,[]],\"about\"]],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,12,[\"item\"]],\"expected `ddm.item` to be a contextual component but found a string. Did you mean `(component ddm.item)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L11:C9) \"],null]],null,{\"statements\":[[0,\"      \"],[7,\"a\"],[12,\"href\",[29,\"concat\",[[25,[\"url\"]],\"/getting-started/beginner\"],null]],[11,\"class\",\"nav-button dropdown-item\"],[9],[0,\"getting started\"],[3,\"action\",[[24,0,[]],\"gettingStarted\"]],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,12,[\"item\"]],\"expected `ddm.item` to be a contextual component but found a string. Did you mean `(component ddm.item)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L14:C9) \"],null]],null,{\"statements\":[[0,\"      \"],[7,\"a\"],[12,\"href\",[29,\"concat\",[[25,[\"url\"]],\"/guides/root\"],null]],[11,\"class\",\"nav-button dropdown-item\"],[9],[0,\"guides\"],[3,\"action\",[[24,0,[]],\"guides\"]],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,12,[\"item\"]],\"expected `ddm.item` to be a contextual component but found a string. Did you mean `(component ddm.item)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L17:C9) \"],null]],null,{\"statements\":[[0,\"      \"],[7,\"a\"],[12,\"href\",[29,\"concat\",[[25,[\"url\"]],\"/people\"],null]],[11,\"class\",\"nav-button dropdown-item\"],[9],[0,\"people\"],[3,\"action\",[[24,0,[]],\"people\"]],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,12,[\"item\"]],\"expected `ddm.item` to be a contextual component but found a string. Did you mean `(component ddm.item)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L20:C9) \"],null]],null,{\"statements\":[[0,\"      \"],[7,\"a\"],[12,\"href\",[29,\"concat\",[[25,[\"url\"]],\"/inputs\"],null]],[11,\"class\",\"nav-button dropdown-item\"],[9],[0,\"inputs\"],[3,\"action\",[[24,0,[]],\"inputs\"]],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,12,[\"item\"]],\"expected `ddm.item` to be a contextual component but found a string. Did you mean `(component ddm.item)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L23:C9) \"],null]],null,{\"statements\":[[0,\"      \"],[7,\"a\"],[12,\"href\",[29,\"concat\",[[25,[\"url\"]],\"/outputs\"],null]],[11,\"class\",\"nav-button dropdown-item\"],[9],[0,\"outputs\"],[3,\"action\",[[24,0,[]],\"outputs\"]],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,12,[\"item\"]],\"expected `ddm.item` to be a contextual component but found a string. Did you mean `(component ddm.item)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L26:C9) \"],null]],null,{\"statements\":[[0,\"      \"],[7,\"a\"],[12,\"href\",[29,\"concat\",[[25,[\"url\"]],\"/d/ /views/0\"],null]],[11,\"class\",\"nav-button dropdown-item\"],[9],[0,\"projects\"],[3,\"action\",[[24,0,[]],\"docs\"]],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,12,[\"item\"]],\"expected `ddm.item` to be a contextual component but found a string. Did you mean `(component ddm.item)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L29:C9) \"],null]],null,{\"statements\":[[0,\"      \"],[7,\"a\"],[12,\"href\",[29,\"concat\",[[25,[\"url\"]],\"/examples\"],null]],[11,\"class\",\"nav-button dropdown-item\"],[9],[0,\"examples\"],[3,\"action\",[[24,0,[]],\"examples\"]],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"\\n\"],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,12,[\"item\"]],\"expected `ddm.item` to be a contextual component but found a string. Did you mean `(component ddm.item)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L33:C9) \"],null]],null,{\"statements\":[[0,\"      \"],[7,\"a\"],[12,\"href\",[29,\"concat\",[[25,[\"url\"]],\"/d/\",[25,[\"sessionAccount\",\"currentUserName\"]],\"/views/0\"],null]],[11,\"class\",\"nav-button dropdown-item\"],[9],[0,\"my projects\"],[3,\"action\",[[24,0,[]],\"docs\"]],[10],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[12]},null]],\"parameters\":[11]},null]],\"parameters\":[]},{\"statements\":[[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,1,[\"dropdown\"]],\"expected `nav.dropdown` to be a contextual component but found a string. Did you mean `(component nav.dropdown)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L39:C3) \"],null]],null,{\"statements\":[[0,\"  \"],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,9,[\"toggle\"]],\"expected `dd.toggle` to be a contextual component but found a string. Did you mean `(component dd.toggle)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L40:C5) \"],null]],[[\"class\"],[\"nav-dropdown\"]],{\"statements\":[[0,\" about \"],[7,\"span\"],[11,\"class\",\"caret\"],[9],[10]],\"parameters\":[]},null],[0,\"\\n\"],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,9,[\"menu\"]],\"expected `dd.menu` to be a contextual component but found a string. Did you mean `(component dd.menu)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L41:C5) \"],null]],null,{\"statements\":[[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,10,[\"item\"]],\"expected `ddm.item` to be a contextual component but found a string. Did you mean `(component ddm.item)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L42:C7) \"],null]],null,{\"statements\":[[0,\"    \"],[7,\"a\"],[12,\"href\",[29,\"concat\",[[25,[\"url\"]],\"/onAbout\"],null]],[11,\"class\",\"nav-button dropdown-item\"],[9],[0,\"about\"],[3,\"action\",[[24,0,[]],\"about\"]],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,10,[\"item\"]],\"expected `ddm.item` to be a contextual component but found a string. Did you mean `(component ddm.item)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L45:C7) \"],null]],null,{\"statements\":[[0,\"    \"],[7,\"a\"],[12,\"href\",[29,\"concat\",[[25,[\"url\"]],\"/people\"],null]],[11,\"class\",\"nav-button dropdown-item\"],[9],[0,\"people\"],[3,\"action\",[[24,0,[]],\"people\"]],[10],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[10]},null]],\"parameters\":[9]},null],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,1,[\"dropdown\"]],\"expected `nav.dropdown` to be a contextual component but found a string. Did you mean `(component nav.dropdown)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L50:C5) \"],null]],null,{\"statements\":[[0,\"    \"],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,7,[\"toggle\"]],\"expected `dd.toggle` to be a contextual component but found a string. Did you mean `(component dd.toggle)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L51:C7) \"],null]],[[\"class\"],[\"nav-dropdown\"]],{\"statements\":[[0,\" explore \"],[7,\"span\"],[11,\"class\",\"caret\"],[9],[10]],\"parameters\":[]},null],[0,\"\\n\"],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,7,[\"menu\"]],\"expected `dd.menu` to be a contextual component but found a string. Did you mean `(component dd.menu)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L52:C7) \"],null]],null,{\"statements\":[[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,8,[\"item\"]],\"expected `ddm.item` to be a contextual component but found a string. Did you mean `(component ddm.item)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L53:C9) \"],null]],null,{\"statements\":[[0,\"      \"],[7,\"a\"],[12,\"href\",[29,\"concat\",[[25,[\"url\"]],\"/examples/root\"],null]],[11,\"class\",\"nav-button dropdown-item\"],[9],[0,\"examples\"],[3,\"action\",[[24,0,[]],\"examples\"]],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,8,[\"item\"]],\"expected `ddm.item` to be a contextual component but found a string. Did you mean `(component ddm.item)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L56:C9) \"],null]],null,{\"statements\":[[0,\"      \"],[7,\"a\"],[12,\"href\",[29,\"concat\",[[25,[\"url\"]],\"/inputs\"],null]],[11,\"class\",\"nav-button dropdown-item\"],[9],[0,\"inputs\"],[3,\"action\",[[24,0,[]],\"inputs\"]],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,8,[\"item\"]],\"expected `ddm.item` to be a contextual component but found a string. Did you mean `(component ddm.item)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L59:C9) \"],null]],null,{\"statements\":[[0,\"      \"],[7,\"a\"],[12,\"href\",[29,\"concat\",[[25,[\"url\"]],\"/outputs\"],null]],[11,\"class\",\"nav-button dropdown-item\"],[9],[0,\"outputs\"],[3,\"action\",[[24,0,[]],\"outputs\"]],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,8,[\"item\"]],\"expected `ddm.item` to be a contextual component but found a string. Did you mean `(component ddm.item)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L62:C9) \"],null]],null,{\"statements\":[[0,\"      \"],[7,\"a\"],[12,\"href\",[29,\"concat\",[[25,[\"url\"]],\"/d/ /views/0\"],null]],[11,\"class\",\"nav-button dropdown-item\"],[9],[0,\"projects\"],[3,\"action\",[[24,0,[]],\"docs\"]],[10],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[8]},null]],\"parameters\":[7]},null],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,1,[\"dropdown\"]],\"expected `nav.dropdown` to be a contextual component but found a string. Did you mean `(component nav.dropdown)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L67:C5) \"],null]],null,{\"statements\":[[0,\"    \"],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,5,[\"toggle\"]],\"expected `dd.toggle` to be a contextual component but found a string. Did you mean `(component dd.toggle)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L68:C7) \"],null]],[[\"class\"],[\"nav-dropdown\"]],{\"statements\":[[0,\" learn \"],[7,\"span\"],[11,\"class\",\"caret\"],[9],[10]],\"parameters\":[]},null],[0,\"\\n\"],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,5,[\"menu\"]],\"expected `dd.menu` to be a contextual component but found a string. Did you mean `(component dd.menu)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L69:C7) \"],null]],null,{\"statements\":[[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,6,[\"item\"]],\"expected `ddm.item` to be a contextual component but found a string. Did you mean `(component ddm.item)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L70:C9) \"],null]],null,{\"statements\":[[0,\"      \"],[7,\"a\"],[12,\"href\",[29,\"concat\",[[25,[\"url\"]],\"/getting-started/beginner\"],null]],[11,\"class\",\"nav-button dropdown-item\"],[9],[0,\"getting started\"],[3,\"action\",[[24,0,[]],\"gettingStarted\"]],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,6,[\"item\"]],\"expected `ddm.item` to be a contextual component but found a string. Did you mean `(component ddm.item)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L73:C9) \"],null]],null,{\"statements\":[[0,\"      \"],[7,\"a\"],[12,\"href\",[29,\"concat\",[[25,[\"url\"]],\"/guides/root\"],null]],[11,\"class\",\"nav-button dropdown-item\"],[9],[0,\"guides\"],[3,\"action\",[[24,0,[]],\"guides\"]],[10],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[6]},null]],\"parameters\":[5]},null],[4,\"if\",[[25,[\"session\",\"isAuthenticated\"]]],null,{\"statements\":[[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,1,[\"dropdown\"]],\"expected `nav.dropdown` to be a contextual component but found a string. Did you mean `(component nav.dropdown)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L79:C7) \"],null]],null,{\"statements\":[[0,\"      \"],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,2,[\"toggle\"]],\"expected `dd.toggle` to be a contextual component but found a string. Did you mean `(component dd.toggle)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L80:C9) \"],null]],[[\"class\"],[\"nav-dropdown\"]],{\"statements\":[[0,\"my projects \"],[7,\"span\"],[11,\"class\",\"caret\"],[9],[10]],\"parameters\":[]},null],[0,\"\\n\"],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,2,[\"menu\"]],\"expected `dd.menu` to be a contextual component but found a string. Did you mean `(component dd.menu)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L81:C9) \"],null]],null,{\"statements\":[[4,\"each\",[[25,[\"ownedDocuments\"]]],null,{\"statements\":[[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,3,[\"item\"]],\"expected `ddm.item` to be a contextual component but found a string. Did you mean `(component ddm.item)`? ('ember-share-db/templates/components/main-navigation.hbs' @ L83:C11) \"],null]],null,{\"statements\":[[0,\"            \"],[7,\"a\"],[11,\"class\",\"dropdown-item\"],[9],[1,[24,4,[\"name\"]],false],[3,\"action\",[[24,0,[]],\"openDoc\",[24,4,[\"id\"]]]],[10],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[4]},null],[0,\"        \"],[7,\"a\"],[11,\"id\",\"create-doc-dropdown-item\"],[11,\"class\",\"dropdown-item\"],[9],[0,\"...\"],[3,\"action\",[[24,0,[]],\"allDocs\"]],[10],[0,\"\\n        \"],[7,\"a\"],[11,\"id\",\"create-doc-dropdown-item\"],[11,\"class\",\"dropdown-item\"],[9],[0,\"+\"],[3,\"action\",[[24,0,[]],\"createDoc\"]],[10],[0,\"\\n\"]],\"parameters\":[3]},null]],\"parameters\":[2]},null]],\"parameters\":[]},null]],\"parameters\":[]}]],\"parameters\":[1]},null],[4,\"if\",[[25,[\"session\",\"isAuthenticated\"]]],null,{\"statements\":[[0,\"  \"],[7,\"div\"],[11,\"id\",\"login-container\"],[9],[0,\"\\n    \"],[7,\"div\"],[11,\"style\",\"float:right;\"],[11,\"class\",\"tooltip\"],[9],[0,\"\\n      \"],[7,\"a\"],[11,\"id\",\"login-button\"],[11,\"class\",\"navbar-btn navbar-right pull-right\"],[9],[0,\"log out\"],[3,\"action\",[[24,0,[]],\"logout\"]],[10],[0,\"\\n      \"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[0,\"logged in as \"],[1,[25,[\"sessionAccount\",\"currentUserName\"]],false],[10],[0,\"\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[7,\"div\"],[11,\"id\",\"login-container\"],[9],[0,\"\\n \"],[7,\"a\"],[11,\"id\",\"login-button\"],[11,\"class\",\"navbar-right\"],[9],[0,\"sign up/log in\"],[3,\"action\",[[24,0,[]],\"login\"]],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"parameters\":[]}],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/main-navigation.hbs" } });
});
;define("ember-share-db/templates/components/mario-guide", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "cQ8WCc7A", "block": "{\"symbols\":[],\"statements\":[[7,\"h1\"],[9],[0,\"Use A Magenta Model to Rewrite the Mario Theme\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  As Magenta's RNN models are good for continuing sequences, we decided to see if it could make an improvement on a classic. This project is also an interetsing one to check out if you want to get Magenta working with Charlie Robert's Gibber library.\\n\"],[10],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"width\",\"height\"],[\"a8baea19-711f-4e43-46ab-71e5212ed5db\",\"250px\",\"650px\"]]],false],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/mario-guide.hbs" } });
});
;define("ember-share-db/templates/components/markov-guide", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "dKSWeVKY", "block": "{\"symbols\":[],\"statements\":[[7,\"h1\"],[9],[0,\"Learn about Markov Models with Drums\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  Markov chains model the probability of moving from one state to another state, for example, if it is sunny today, what is the probability it will reamin sunny, or rain the next day? Because of this, it is great for modelling and generating musical patterns if we think as each step in a score as moving from one state to another. A great place to get an intuition for Markov models is \"],[7,\"a\"],[11,\"href\",\"https://setosa.io/ev/markov-chains/\"],[9],[0,\"here\"],[10],[0,\".\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  The project below is an example that allows you to build a corpus of drum rhythms (instead of text) and then generate new music from it. The model code itself is built upon Daniel Shiffman's \"],[7,\"a\"],[11,\"href\",\"https://www.youtube.com/watch?v=eGFJ8vugIWA\"],[9],[0,\"Coding Train project\"],[10],[0,\".\\n\"],[10],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"width\",\"height\"],[\"5f827ca2-aae0-b755-e432-f815c00a482a\",\"250px\",\"650px\"]]],false],[0,\"\\n\"],[7,\"h2\"],[9],[0,\"Markov Model Experiments\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[11,\"style\",\"margin:20px;\"],[9],[0,\"\\n  \"],[7,\"ol\"],[9],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"\\n      Have a play around with inserting different rhythms into the dataset and generating new ones. Currently, the format is each character is one 16th, with spaces acting as rests.\\n    \"],[10],[0,\"\\n    \"],[7,\"img\"],[11,\"style\",\"width:auto;height:350px\"],[11,\"class\",\"tutorial-img\"],[12,\"src\",[29,\"concat\",[[25,[\"url\"]],\"mono-markov.png\"],null]],[9],[10],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"\\n      We are now going to try and edit the code. Click the green \\\"Open Project\\\" button above, then fork this project by clicking the button in the banner over the code editor, you now have your own copy of this project you can edit.\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"\\n      First, we are going to play around with the order of the Markov model. You can do this by going to the “Markov” tab and changing the variable “order” at the top. Rerun the project and see how different orders effects the drum beats you can generate. Also, this method will generate either sequences of 16, or until there are no more options for it to continue. You can edit this behaviour in the “markovIt()” function, trying different lengths. How does changing the order effect this behaviour?\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"\\n      The generated sequence is initialised using the first n-characters of the dataset. Update the “markovIt()” method to start the generated sequence with a random substring from the dataset. How does this effect the audio you can make?\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"\\n      \"],[7,\"p\"],[9],[0,\"\\n        Next, we are going to make the drum machine polyphonic, and doing so will require us changing both the audio engine and the Markov model. Currently, each token in the model is one character, but we need to edit this so each token is a string (of variable length), delimited by a character.\\n       \"],[10],[0,\"\\n       \"],[7,\"p\"],[9],[0,\"\\n        Keep in your mind that going from monophonic to polyphonic musical sequences is \"],[7,\"em\"],[9],[0,\"essentially the same as going from characters to words in text analysis.\"],[10],[0,\".\\n      \"],[10],[0,\"\\n        \"],[7,\"p\"],[9],[0,\" Below we see two simple polyphonic beats, where spaces delimit notes and hyphens (“-“) represent a rest (no drums). On the left is the sequence of characters, on the right is the respective musical score.\\n      \"],[10],[0,\"\\n      \"],[7,\"img\"],[11,\"style\",\"width:auto;height:350px\"],[11,\"class\",\"tutorial-img\"],[12,\"src\",[29,\"concat\",[[25,[\"url\"]],\"poly-markov.png\"],null]],[9],[10],[0,\"\\n      \"],[7,\"p\"],[9],[0,\"\\n       The method “setupGrams()” is where the dataset (stored as an array of string in the “pattern” variable), is analysed and turned into a Markov model. Currently, each token/gram is a substring of this, length of which is decided by the “order” variable.\\n     \"],[10],[0,\"\\n      \"],[7,\"p\"],[9],[0,\"\\n      Edit this function so that the model works on strings separated by spaces as tokens (instead of a single character) as described above.\\n      \"],[10],[0,\"\\n       \"],[7,\"p\"],[9],[0,\"\\n      Hint: First you will need to split dataset string on spaces (“ “), see Javascript’s split(“ “) function. This is will give an array of tokens to iterate through to build your dataset. You can also use slice() to slice sections of arrays and join(“ “) to collapse arrays into strings, delimited by spaces.\\n      \"],[10],[0,\"\\n       \"],[7,\"p\"],[9],[0,\"\\n      String \"],[7,\"a\"],[11,\"href\",\"https://www.w3schools.com/jsref/jsref_split.asp\"],[9],[0,\"split()\"],[10],[0,\" \"],[7,\"br\"],[9],[10],[0,\"\\n      Array \"],[7,\"a\"],[11,\"href\",\"https://www.w3schools.com/jsref/jsref_join.asp\"],[9],[0,\"join()\"],[10],[7,\"br\"],[9],[10],[0,\"\\n      Array \"],[7,\"a\"],[11,\"href\",\"https://www.w3schools.com/jsref/jsref_slice_array.asp\"],[9],[0,\"slice()\"],[10],[7,\"br\"],[9],[10],[0,\"\\n      \"],[10],[0,\"\\n       \"],[7,\"p\"],[9],[0,\"\\n      You will also need to update the “markovIt()” function (where new patterns are generated) to account for the new format.\\n      \"],[10],[0,\"\\n       \"],[7,\"p\"],[9],[0,\"\\n      Hint: Specifically, look at how the “result” string is built up (maybe use an array instead and join(“ “) back together at the end to return a string), and how the “currentGram” variable is updated after every new generation.\\n      \"],[10],[0,\"\\n    \"],[10],[0,\"\\n       \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[7,\"p\"],[9],[0,\"\\n    Now we can update the audio engine to account for the new format of strings. The “loopPlayer()” function in the “Audio” tab is where this happens. The current pattern is stored in the “sequence” variable as a string, and at every step a pointer increments and looks at a different character.\\n    \"],[10],[0,\"\\n     \"],[7,\"p\"],[9],[0,\"\\n      Update the audio engine so that “sequence” is first converted to an array of strings, and instead of looking at one character to determine which drum to play, look at whether a particular character is present and play all that are. E.g. the token “ksoc” would play a kick, snare and both hihats on that step.\\n      \"],[10],[0,\"\\n      \"],[7,\"p\"],[9],[0,\"\\n      Hint:The Javascript string functions split() and includes() are your friends here. You’ll probably need to change the switch statement to multiple if statements.\\n    \"],[10],[0,\"\\n    \"],[7,\"p\"],[9],[0,\"\\n      String \"],[7,\"a\"],[11,\"href\",\"https://www.w3schools.com/jsref/jsref_includes.asp\"],[9],[0,\"includes()\"],[10],[7,\"br\"],[9],[10],[0,\"\\n      \"],[10],[0,\"\\n      \"],[7,\"p\"],[9],[0,\"\\n      OPTIONAL BONUS: Have you accounted for the order of characters in the tokens? Does this matter? If it does, can you make your sketch robust to this?\\n    \"],[10],[0,\"\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"\\n      \"],[7,\"p\"],[9],[0,\"\\n        If you're done, or stuck you can check out the \"],[7,\"a\"],[11,\"href\",\"https://mimicproject.com/code/67038206-8c17-876c-781a-b515cf93a013\"],[9],[0,\" finished polyphonic project\"],[10],[0,\" here.\\n      \"],[10],[0,\"\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/markov-guide.hbs" } });
});
;define("ember-share-db/templates/components/maxiinstrument-guide", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "oAgw/Pmw", "block": "{\"symbols\":[],\"statements\":[[7,\"h2\"],[9],[0,\"MaxiInstruments\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nMaxiInstruments is a class of simple synths and samplers that are designed to so that their parameters can be easily controlled using the \"],[7,\"a\"],[11,\"href\",\"https://mimicproject.com/guides/learner\"],[9],[0,\"Learner.js\"],[10],[0,\" library. They are AudioWorklets backed so do not get interrupted by beefy feature extractors one might use an an input or the running of a model to do the mapping.\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nIf you would like to check out the JSDoc API documentation, or the look at the source code, see the links below.\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"ul\"],[9],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      \"],[7,\"a\"],[11,\"href\",\"https://www.doc.gold.ac.uk/~lmcca002/MaxiInstruments.html\"],[9],[0,\"Documentation\"],[10],[0,\"\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      \"],[7,\"a\"],[11,\"href\",\"https://github.com/Louismac/learnerjs\"],[9],[0,\"Github\"],[10],[0,\"\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nNow (as of October 2021), MaxiInstruments will work in \"],[7,\"strong\"],[9],[0,\"Google Chrome and Mozilla Firefox\"],[10],[0,\".\\n\"],[10],[0,\"\\n\\n\"],[2,\" <p class = \\\"tutorial-text\\\">\\nPreviously, Chromium-based browsers (around Chrome 79) had a bug that may cause slight crackling in Audio Worklet based programs. However, we now believe this bug to be fixed (Chrome 80 onwards). If you are experiencing this issue, <a href = \\\"https://bugs.chromium.org/p/chromium/issues/detail?id=1033493#c42\\\">you can follow the bug </a>and also download and run <a href =\\\"https://www.google.com/chrome/canary/\\\" >Canary (newer beta version of Chrome)</a> or <a href = \\\"https://www.slimjet.com/chrome/google-chrome-old-version.php\\\">older versions of Chrome</a> to get better results.\\n</p> \"],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-heading-big\"],[9],[0,\"\\nA Simple Example\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nBefore we look at any of the code, we're going to look at a bare bones MaxiInstruments Synthesiser project. No Machine Learning yet. Just vibes.\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nYou'll see you get a lovely synth with a bunch of parameters to play around with\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[7,\"ol\"],[9],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"Unmute it!\"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"Try changing the main oscillator (top left)\"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"Play around with the parameters, you can try\\n    \"],[7,\"ul\"],[9],[0,\"\\n      \"],[7,\"li\"],[9],[0,\"The amplitude envelope (attack, decay, sustain, release)\"],[10],[0,\"\\n      \"],[7,\"li\"],[9],[0,\"LFO on the pitch, filter and amplitude\"],[10],[0,\"\\n      \"],[7,\"li\"],[9],[0,\"Reverb and Delay effects.\"],[10],[0,\"\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"If you're unsure of what all the controls do, try some of the Presets \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"height\",\"manualLoad\"],[\"20d53be4-d662-1f0b-faae-a45114374ed3\",\"700px\",false]]],false],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-heading-big\"],[9],[0,\"\\nLearning the Library\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  If you hit the \"],[7,\"strong\"],[9],[0,\"Show Code\"],[10],[0,\" button in the bottom right on the project above, you can see how its made. Its not a lot of code! The rest of this document will go through this code from the MaxiInstruments library step by step and have you making amazing projects in no time.\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nYou can follow along looking at the code above, or select \"],[7,\"strong\"],[9],[0,\"Go To Project\"],[10],[0,\" (the big green button) to check out the project in a separate tab. Otherwise, you can make a new project from scratch and follow along that way.\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-heading-big\"],[9],[0,\"\\n1. Set up\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThe MaxiInstruments.js library lives on the Mimic website and the first thing we have to do is include the library in our document. You can add the following code to the HTML at the top of your project.\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\n<script src = \\\"https://mimicproject.com/libs/maxiInstruments.v.0.7.js\\\"></script>\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nNow some Javascript! First thing we need to do is make an instance of the main MaxiInstruments object and save it in a variable to refer to later.\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\nconst maxiInstruments = new MaxiInstruments();\\n\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-heading-big\"],[9],[0,\"\\n2. Add the GUI\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nIn order to get all the useful interfaces in our project, we need to tell MaxiInstruments.js which \"],[7,\"strong\"],[9],[0,\"existing HTML element in our project\"],[10],[0,\" to attach the synths and samplers to when we make them.\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\ninstruments.guiElement = document.getElementById(\\\"synths\\\");\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-heading-big\"],[9],[0,\"\\n3. Load the modules\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nBefore we get down to making our instruments we first need to load the audio worklets processor. To make sure all this set up is done before we get going, we make use of some \"],[7,\"strong\"],[9],[0,\"asynchronous\"],[10],[0,\" functionality in Javascript called \"],[7,\"a\"],[11,\"href\",\"\"],[9],[0,\"Promises\"],[10],[0,\".\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  You don't need to get into the details of this if you don't want! The important thing to know is that after calling \"],[7,\"code\"],[9],[0,\"instruments.loadModules()\"],[10],[0,\", we pass in another function that gets called \"],[7,\"strong\"],[9],[0,\"after\"],[10],[0,\" the modules have been loaded.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  Basically, all of the fun stuff happens \"],[7,\"strong\"],[9],[0,\"within this function\"],[10],[0,\".\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\ninstruments.loadModules().then(()=> {\\n\\n//Add instruments here!!\\n\\n});\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-heading-big\"],[9],[0,\"\\n4. Creating An Instrument\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThe main \"],[7,\"code\"],[9],[0,\"MaxiInstruments\"],[10],[0,\" object in a container for all of your instruments, meaning they can share some functionality, like a global clock to keep them all in time for instance! At the moment there is one synthesiser, \"],[7,\"code\"],[9],[0,\"MaxiSynth\"],[10],[0,\" (a simple subtractive synthesiser), and \"],[7,\"code\"],[9],[0,\"MaxiSampler\"],[10],[0,\" (which is surprisingly, a sampler!).\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  We'll cover the \"],[7,\"code\"],[9],[0,\"MaxiSynth\"],[10],[0,\", as thats what we've been looking at so far. By default, it is a \"],[7,\"strong\"],[9],[0,\"8 voice polyphonic synthesiser\"],[10],[0,\".\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nUse the code below to add one synth. You can add up to 8 to a single \"],[7,\"code\"],[9],[0,\"MaxiInstruments\"],[10],[0,\" object, depending on how much your set up can handle. Each will have its own GUI.\\n\\nThe constructor returns the synth, but you can also access it from the \"],[7,\"code\"],[9],[0,\"instruments.synths\"],[10],[0,\" property.\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\nconst synth = instruments.addSynth();\\n//Also can be accessed from instruments.synths[0];\\n\\nconst synth2 = instruments.addSynth();\\n//Also can be accessed from instruments.synths[1];\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-heading-big\"],[9],[0,\"\\n5. Playing a Song\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\nThe Clock\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThere is a global clock that lives in \"],[7,\"code\"],[9],[0,\"MaxiInstruments\"],[10],[0,\" object and is shared by all the synths and samplers associated with it. You can set the tempo in bpm.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThe clock allows for sequencing at the level of \"],[7,\"strong\"],[9],[0,\"ticks\"],[10],[0,\", with the default, minimal resolution of \"],[7,\"strong\"],[9],[0,\"24 ticks per beat\"],[10],[0,\".\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\ninstruments.setTempo(80);\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\nSetting a Sequence\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nIn the example above, we are playing a loop of a few chords. To do this, we have made a sequence and set it to the specific instrument that we want to play it (in this case the first synth).\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nA sequence is an \"],[7,\"strong\"],[9],[0,\"array of note objects\"],[10],[0,\".\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nEach note object is a Javascript object with some of the following properties. You can use the full name or just initial them.\\n\"],[7,\"ul\"],[9],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"pitch or p: MIDI pitch of the note. Can be a single value or array of values\"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"freq or f: Frequency in Hz (an alternative to pitch). Can be a single value or array of values\"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"start or s: Start in ticks. Can be a single value or array of values\"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"end or e: End in ticks\"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"length or l: Length in ticks (an alternative to end)\"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"velocity or v: Velocity (optional) (0-127)\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\\t\"],[7,\"code\"],[9],[0,\"\\nconst synthSeq = [\\n    {pitch:60, start:[0, 2, 4], end:12, velocity:127},\\n    {p:67, s:49, l:34, v:60},\\n    {p:[67, 60, 70], s:49, l:34, v:60},\\n    {freq:[440, 606, 2000], start:49, e:134},\\n  ];\\nsynth.setSequence(synthSeq);\\n\\t\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nWhen we've built up our \"],[7,\"strong\"],[9],[0,\"array of note objects\"],[10],[0,\", we can then use the \"],[7,\"code\"],[9],[0,\"setSequence()\"],[10],[0,\" to play it on one of our \"],[7,\"code\"],[9],[0,\"MaxiSynth\"],[10],[0,\" objects.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nIn the example below, we have passed a second, optional parameter. If we dont provide this, any lengths or positions given in the sequence will be interpretted at the default \"],[7,\"strong\"],[9],[0,\"24 ticks per beat\"],[10],[0,\". However, if you can also state a ticks per beat yourself. In the example at the top, we have used \"],[7,\"strong\"],[9],[0,\"4 ticks per beat (1/16ths)\"],[10],[0,\", because don't require more than a resolution of 1/16ths.\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\\t\"],[7,\"code\"],[9],[0,\"\\nsynth.setSequence(synthSeq, 4); //4 ticks per beat (1/16ths)\\n\\t\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\nLoops\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nFinally, you can set your sequence to loop round at a given length. You can set the loop on the main \"],[7,\"code\"],[9],[0,\"MaxiInstruments\"],[10],[0,\" object, or you can have individual loops for \"],[7,\"strong\"],[9],[0,\"each instrument!\"],[10],[0,\".\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nAs with \"],[7,\"code\"],[9],[0,\"setSequence()\"],[10],[0,\", we can provide a second, optional parameter. If we dont provide this, the loop length will be interpretted at the default \"],[7,\"strong\"],[9],[0,\"24 ticks per beat\"],[10],[0,\". However, if you can also state a ticks per beat yourself.\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\\t\"],[7,\"code\"],[9],[0,\"\\ninstruments.setLoop(96); //4 Beats, set all instruments (default 24 ticks per beat)\\ninstruments.setLoop(16, 4); //4 Beats, set all instruments (4 ticks per beat)\\nsyn.setLoop(96); //Or set individual loops for each instrument\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-heading-big\"],[9],[0,\"\\n6. Controlling Instruments with Machine Learning\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nOne of the best things about the \"],[7,\"code\"],[9],[0,\"MaxiInstruments\"],[10],[0,\" set up is that their parameters are super easy connected to the  \"],[7,\"a\"],[11,\"href\",\"https://mimicproject.com/guides/learner\"],[9],[0,\"Learner.js\"],[10],[0,\" library. This means you can drive the sounds they make from a variety of inputs including video, audio and sensors, via a machine learning model.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\nBody Example\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThe example below show how we can take the \"],[7,\"strong\"],[9],[0,\"51 inputs\"],[10],[0,\" from Google's BodyPix skeleton tracker, and use them to control \"],[7,\"strong\"],[9],[0,\"9 different parameters\"],[10],[0,\" of the \"],[7,\"code\"],[9],[0,\"MaxiSynth\"],[10],[0,\".\\n\"],[7,\"ol\"],[9],[0,\"\\n  \"],[7,\"li\"],[9],[7,\"strong\"],[9],[0,\"Check the camera is working\"],[10],[0,\". If it is, you will seem an outline of your body in differeny coloured splodges (its a technical term). If not, try refreshing the example with the play/pause buttons in the bottom right.\"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[7,\"strong\"],[9],[0,\"Find some sounds you like\"],[10],[0,\". We have picked 9 parameters of the synth to map with the machine learning model. Hit the \"],[7,\"code\"],[9],[0,\"Randomise\"],[10],[0,\" button and you'll see which ones they are\"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[7,\"strong\"],[9],[0,\"Record some examples\"],[10],[0,\". Stand in the middle of the screen and hit \"],[7,\"code\"],[9],[0,\"Record\"],[10],[0,\", after a couple of seconds, hit \"],[7,\"code\"],[9],[0,\"Stop\"],[10],[0,\".\"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"Now find a new sound you like, and record again alongside \"],[7,\"strong\"],[9],[0,\"a different pose.\"],[10],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"Click \"],[7,\"code\"],[9],[0,\"Train\"],[10],[0,\" to train and start running your model. You should hear the sound change and you move your body!\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"height\",\"manualLoad\"],[\"ea907b8a-f71f-0c9a-a93f-f4396894fc80\",\"700px\",false]]],false],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-heading-big\"],[9],[0,\"\\nLooking at the Code\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\nPicking Your Parameters\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nFirst, you'll decide which parameters you want to map. The \"],[7,\"code\"],[9],[0,\"MaxiSynth\"],[10],[0,\" has 20 you can map.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[7,\"strong\"],[9],[0,\"Pro Tip: \"],[10],[0,\" You can use the \"],[7,\"code\"],[9],[0,\"Print\"],[10],[0,\" button on a \"],[7,\"code\"],[9],[0,\"MaxiSynth\"],[10],[0,\" to log all the current values of your synth into the browsers console. You can use this to get a full list of the mappable parameters!\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nEach synth has a \"],[7,\"code\"],[9],[0,\"mapped\"],[10],[0,\" property where we provide an array of the parameters we want to control with \"],[7,\"code\"],[9],[0,\"Learner.js\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\nsyn.mapped = [\\\"frequency\\\", \\\"attack\\\"];\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\nMaking the Model\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nYou can now start mapping your chosen parameters to a given input using the Learner.js library. More information about how to set this up can be found in this \"],[7,\"a\"],[11,\"href\",\"https://mimicproject.com/guides/learner\"],[9],[0,\"guide\"],[10],[0,\".\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nWe will use a \"],[7,\"strong\"],[9],[0,\"Regression Model\"],[10],[0,\" (because all of our parameters are continuous numbers). What we need to find out it how many outputs we need to control and \"],[7,\"code\"],[9],[0,\"MaxiInstruments\"],[10],[0,\" has a method to work this out for us. The second argument of \\\"false\\\" tells Learner.js that you don't need an additional GUI for your regression model, because you have the GUI provided by the instrument.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThe final argument (10), tells Learner.js to smooth the output over 10 frames.\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\nlearner.addRegression(instruments.getNumMappedOutputs(), false, 10);\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\nInputting the Camera and Synth data\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nTo build up our dataset, we use the Learner.js \"],[7,\"code\"],[9],[0,\"newExample()\"],[10],[0,\" function. We need to make pairs of the current \"],[7,\"strong\"],[9],[0,\"body coordinates (input)\"],[10],[0,\" and \"],[7,\"strong\"],[9],[0,\"synth parameters (output)\"],[10],[0,\".\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nIn order to get the current values from the synthesiser, the \"],[7,\"code\"],[9],[0,\"MaxiInstruments\"],[10],[0,\" object will give you all the current values of the mapped parameters of all your instruments with the \"],[7,\"code\"],[9],[0,\"getMappedOutputs()\"],[10],[0,\" function.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nIt is important to note that one piece of code (below) serves two purposes.\\n\"],[7,\"ul\"],[9],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"If you are \"],[7,\"strong\"],[9],[0,\"recording\"],[10],[0,\", every time you add a new example the pairing is stored in the dataset.\"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"If you are \"],[7,\"strong\"],[9],[0,\"running\"],[10],[0,\", just the input is used and given to the model, which then provides a new output based on the data it has seen.\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\nvar onNewCameraData = (newCameraData)=> {\\n  //Match them with outputs (instrument parameters)\\n  learner.newExample(newCameraData, instruments.getMappedOutputs());\\n}\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\nUpdating the Synth from the Model\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nWhenever the model has new outputs (parameters) in response to new inputs (camera data), it calls the \"],[7,\"code\"],[9],[0,\"onOutput()\"],[10],[0,\" function in Learner.js.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThe instruments object can then update the mapped parameters using the \"],[7,\"code\"],[9],[0,\"updateMappedOutputs(data)\"],[10],[0,\" function. This will update your synths sounds, and the user interface. Watch them go!\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\nlearner.onOutput = (data)=> {\\n  //Update the instruments parameters with output of model\\n  instruments.updateMappedOutputs(data);\\n}\\n\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nYou can then pick which parameters of the synth you can like to be controlled by your model by passing an array of names. The code below shows how you would select the frequencies of the two oscillators to be controlled by your regression model.\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\nsyn.mapped = [\\\"frequency\\\", \\\"frequency2\\\"];\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThe synth also has a Randomise button that will select random values for your selected parameters. This can help you find fun sounds when making your own mappings.\\n\"],[10],[0,\" -->\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-heading-big\"],[9],[0,\"\\n7. MaxiSampler\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nAs with the other examples, click \"],[7,\"code\"],[9],[0,\"Show Code\"],[10],[0,\" in the bottom right of the example above to check out the code.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nRemeber to \"],[7,\"strong\"],[9],[0,\"Unmute\"],[10],[0,\"! Its at the top of the sampler object.\\n\"],[10],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"height\",\"manualLoad\"],[\"40cfa189-14dc-684b-6349-df1c535b2c0c\",\"700px\",false]]],false],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\nCreating a Sampler\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nAs promised, we also have a sampler! Similarly to the \"],[7,\"code\"],[9],[0,\"MaxiSynth\"],[10],[0,\", you can have up to 8 samplers (each can hold 8 samples). They are stored in the instrument object’s \"],[7,\"code\"],[9],[0,\"samplers\"],[10],[0,\" property. Each will have its own GUI, showing the controls for 4 samples at a time.\\n\"],[10],[0,\"\\n\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\n  const sampler1 = instruments.addSampler();\\n  //Also can be accessed from instruments.samplers[0];\\n\\n  const sampler2 = instruments.addSampler();\\n  //Also can be accessed from instruments.samplers[1];\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\nLoading a Sample\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nLoad each sample by passing the url and an index (of the 8 slots) to store the sample.\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\nsam.loadSample(\\\"909.wav\\\", 0);\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\nSequencing a Sampler\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThe sequencing is almost exactly the same as with the \"],[7,\"code\"],[9],[0,\"MaxiSynth\"],[10],[0,\", however, instead of using \"],[7,\"strong\"],[9],[0,\"MIDI note values\"],[10],[0,\" for the pitch parameter, we use \"],[7,\"strong\"],[9],[0,\"sample indexes\"],[10],[0,\".\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\n  const samplerSeq = [\\n      {pitch:0, start:0, velocity:127}, //play sample 0\\n      {pitch:1, start:49}, //play sample 1\\n      {p:[1,2,3], s:49}, //play samples 1,2 and 3\\n    ],\\n  sam.setSequence(samplerSeq);\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\nMapping a Sampler's Parameters\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nSimilarly to the MaxiSynth, you can then pick which parameters of the synth you can like to be controlled by your model by passing an array of names. Each samples parameters are identified by an underscored index following the name (this is also visible on the GUI).\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\nsam.mapped = [\\\"rate_0\\\", \\\"gain_1\\\"];\\n\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-heading-big\"],[9],[0,\"\\n8. Advanced MaxiInstrument-ing\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\nManual Triggers\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nBoth samplers and synths respond to simple noteon, noteoff commands. If you are using controlling the frequency of your synth externally, you should also provide a frequency. Second velocity argument is optional.\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\nsyn.noteon(440, 127);\\nsyn.noteoff(440);\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nFor samplers, noteoffs are not necessary and you provide the index of the sample you wish to trigger. For eaxmple, the code below would trigger the sample in the third slot of the first sampler. You only require a noteon for samplers as they are one-shot. Second velocity argument is optional.\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\nsam.noteon(2, 60);\\nsam.noteon(2);\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\nHijacking the Clock\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThe MaxiInstruments object also has a callback called onTick(), called on every tick of the clock, return the playHead for each instrument. If you have the same loop for all instruments, you only need to care about the first item in this array, if not the playheads are returned in the order they were added.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nAs the callback is being executed on the main thread, it does not have any of the advantages of the separate audio thread where the clock resides, as such may be effected by interruptions. It relies on the messaging system between threads and whilst reasonably reliable, it is not advised to use this for time critical actions and it is not guaranteed to be sample-accurately-in-sync with events being triggered on the audio thread.\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\ninstruments.setOnTick((playHeads)=>{\\n  console.log(playHeads)\\n})\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\nContinuous Frequency\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nIf programming the \"],[7,\"code\"],[9],[0,\"MaxiSynth\"],[10],[0,\" using note sequences isn't your jam, you can use it more like a modular oscillator unit. In this mode, it will just output \"],[7,\"strong\"],[9],[0,\"two continuous tones\"],[10],[0,\".\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nYou can either sequence the rhythm and not the pitches, or just trigger one \"],[7,\"code\"],[9],[0,\"noteon()\"],[10],[0,\" at the beginning and leave it running. Check out the example for more details\\n\"],[10],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"height\",\"manualLoad\"],[\"73904a62-b60f-d590-70aa-0495da686a47\",\"700px\",false]]],false],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nEach of the frequencies are individually controllable and you'll see two new controls appear on the synthesisers interface (frequency and frequency2). These are also available to map to a Learner.js model!\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\nsyn.useFreqSliders(true);\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\nMagenta Sequences\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nYou can also input sequences generated from Magenta directly into the synths. Below is an example using one of Magenta's pretrained recurrent neural networks to complete the a given seqeunce, and playing it directly on a MaxiSynth. First import the Magenta library.\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\"],[7,\"code\"],[9],[0,\"\\n<script src = \\\"https://cdn.jsdelivr.net/npm/@magenta/music@1.11.0\\\"></script>\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nIn order to get a continued seqeunce from Magenta's pretrained models, you can specify a seed sequence given\\n\"],[7,\"ul\"],[9],[0,\"\\n\\t\"],[7,\"li\"],[9],[0,\"A tempo\"],[10],[0,\"\\n\\t\"],[7,\"li\"],[9],[0,\"A definition of stepsPerQuarter. We define time in steps and this tells us how many represent a quarter note / crotchet\"],[10],[0,\"\\n\\t\"],[7,\"li\"],[9],[0,\"An array of notes objects, including pitch (MIDI), a start time and end time each in steps\"],[10],[0,\"\\n\\t\"],[7,\"li\"],[9],[0,\"A total length, also in steps\"],[10],[0,\"\\n\"],[10],[0,\"\\nSee the code below as an example\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\\t\"],[7,\"code\"],[9],[0,\"\\nconst inputSeq = {\\n  tempos: [{time:0, qpm:80}],\\n  notes:[\\n    {pitch:60, quantizedStartStep:0, quantizedEndStep:2},\\n    {pitch:67, quantizedStartStep:4, quantizedEndStep:6}\\n  ],\\n  quantizationInfo:{stepsPerQuarter: 4},\\n  totalQuantizedSteps:32,\\n};\\n\\t\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThen you can feed to Magenta, and set the returned sequence directly to synth.\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"\\t\"],[7,\"code\"],[9],[0,\"\\nlet rnn = new mm.MusicRNN(MODEL_URL);\\nrnn.initialize().then(()=> {\\n  rnn.continueSequence(inputSeq, 32, 1.5).then((newSeq)=> {\\n\\n    //Set the tempo and loop point\\n    instruments.setTempo(newSeq.tempos[0].qpm);\\n    const loop = 24 / newSeq.quantizationInfo.stepsPerQuarter * newSeq.totalQuantizedSteps;\\n    instruments.setLoop(loop)\\n\\n    //Set the note sequence\\n    syn.setSequence(newSeq);\\n  });\\n});\\n\\t\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"h2\"],[9],[0,\"More Example Projects\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nHere are some examples sequenced in various ways, mostly using body tracking as an input.\\n\"],[7,\"ul\"],[9],[0,\"\\n  \"],[7,\"li\"],[9],[7,\"a\"],[11,\"href\",\"https://mimicproject.com/code/73d93516-e0de-a85c-5fc7-c6cc03f4666b\"],[9],[0,\"MIDI\"],[10],[10],[0,\" This example allows you to play notes into the synth using an external MIDI instrument, whilst mapping the parameters to a different input. Note WebMidi is curently only supported in Chrome. You can connect to external devices or connect to your internal MIDI bus, \"],[7,\"a\"],[11,\"href\",\"https://help.ableton.com/hc/en-us/articles/209774225-How-to-setup-a-virtual-MIDI-bus\"],[9],[0,\"this is a good resource for how to do that\"],[10],[0,\". If you were generating notes in an another program (Max/MSP, Supercollider, PD), this would be a good way to trigger MaxiSynth. First refresh devices, then select your MIDI source from the dropdown.\\n  \"],[7,\"li\"],[9],[7,\"a\"],[11,\"href\",\"https://mimicproject.com/code/d57c9d9b-284d-9ab3-8118-e7c33eafeeaf\"],[9],[0,\"One shot Sequencer\"],[10],[10],[0,\" This allows you use a one-shot sequencer to program a tune yourself, whilst mapping the parameters of the synths to one of the inputs.\\n  \"],[7,\"li\"],[9],[7,\"a\"],[11,\"href\",\"https://mimicproject.com/code/f6bdb7ad-4cb0-8652-0dee-f0c7db9fede5\"],[9],[0,\"Hand coded sequence\"],[10],[10],[0,\" This shows you how you can program in your own sequence by hand.\\n  \"],[7,\"li\"],[9],[7,\"a\"],[11,\"href\",\"https://mimicproject.com/code/fa99819f-775c-2552-198c-2340739a1b5c\"],[9],[0,\"Magenta Generated sequence\"],[10],[10],[0,\" This shows you how you can generate a sequence using Google's Magenta models and plug that straight into a synth.\\n  \"],[7,\"li\"],[9],[7,\"a\"],[11,\"href\",\"https://mimicproject.com/code/1cc85746-67d2-0cef-7f69-a238c6d2b489\"],[9],[0,\"MIDI File playback\"],[10],[10],[0,\" This shows you how you can upload a MIDI File as an asset then play on a MaxiSynth.\\n\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nYou can find a \"],[7,\"a\"],[11,\"href\",\"https://mimicproject.com/inputs\"],[9],[0,\"bunch of fun inputs\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nYou can also see the source and instructions for running the library locally or in your own projects away from the MIMIC platform in \"],[7,\"a\"],[11,\"href\",\"https://github.com/Louismac/learnerjs\"],[9],[0,\"this repository\"],[10],[0,\".\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/maxiinstrument-guide.hbs" } });
});
;define("ember-share-db/templates/components/maximillian-guide", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "FBnnTdlp", "block": "{\"symbols\":[],\"statements\":[[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  Maximilian.js is a javascript library for sound analysis and synthesis. This document is a reference to the Maxmilian.js API, illustrated with examples.\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-heading-big\"],[9],[0,\"\\nQuick Start\\n\"],[10],[0,\"\\n\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nFork the seed project below to get started with Maximilian.js\\n\"],[10],[0,\"\\n\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"width\",\"height\"],[\"f8452701-1d77-4f42-df1e-75f59cb2c744\",\"250px\",\"600px\"]]],false],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-heading-big\"],[9],[0,\"The Audio Processing Loop\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThe Maximilian audio engine collects audio through a callback function, which is called once per audio sample.  Browsers usually require that this function is initiated by the user (e.g. from a button press)\\n\"],[10],[0,\"\\n\"],[7,\"div\"],[11,\"class\",\"snippet\"],[9],[0,\"\\n   \"],[7,\"pre\"],[9],[0,\"      \"],[7,\"code\"],[11,\"class\",\"javascript\"],[9],[0,\"\\n        var osc1 = new Maximilian.maxiOsc();\\n        function play() {\\n          return (osc1.saw(100)) * 0.5;\\n        }\\n      \"],[10],[0,\"\\n    \"],[10],[0,\"\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"Multi channel audio\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nReturn an array of values to have multi-channel sound (as many channels as are available on your setup)\\n\"],[10],[0,\"\\n\"],[7,\"div\"],[11,\"class\",\"snippet\"],[9],[0,\"\\n   \"],[7,\"pre\"],[9],[0,\"      \"],[7,\"code\"],[11,\"class\",\"javascript\"],[9],[0,\"\\n        var osc1 = new Maximilian.maxiOsc();\\n        var osc2 = new Maximilian.maxiOsc();\\n        function play() {\\n          return [osc1.saw(100),osc1.saw(200)];\\n        }\\n      \"],[10],[0,\"\\n    \"],[10],[0,\"\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-heading-big\"],[9],[0,\"\\nMaximilian.js and AudioWorklets\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nAs of September 2021, Maximilian.js has undergone quite a large change in order to keep up with the ever changing face of signal processing audio on the web.\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nOur previous approach of using the \"],[7,\"a\"],[11,\"href\",\"https://developer.mozilla.org/en-US/docs/Web/API/ScriptProcessorNode\"],[9],[0,\"ScripProcessorNode\"],[10],[0,\" has broadly been deprecated so the existing library was unusable without some major updating.\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nSo now, we have the all singing, all dancing \"],[7,\"strong\"],[9],[0,\"Audio Worklets\"],[10],[0,\" version of Maximilian.js. Largely the same functionality and API, with a few additions in the way you set up your projects. This has the \"],[7,\"strong\"],[9],[0,\"massive advantage\"],[10],[0,\" of running on a dedicated audio thread, greatly reducing interference when you're making your internet-based-interactive-audio-spectaculars.\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\nSeparating Out the Audio Code\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nIf you look at the example above (hit the \"],[7,\"code\"],[9],[0,\"Show Code\"],[10],[0,\" button in the bottom right), you will see there are \"],[7,\"strong\"],[9],[0,\"two script elements\"],[10],[0,\" in the project.\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThe top one (with the id \"],[7,\"code\"],[9],[0,\"myAudioScript\"],[10],[0,\") holds the Maximilian code. This will look super familiar if you've used Maximilian before. It exists in its separate script tag because it needs to be passed through to the separate audio processing thread.\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\nSetting up the Main Javascript\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThere are only three things we need to do initially in the script tags that hold our \"],[7,\"strong\"],[9],[0,\"non-Maximilian\"],[10],[0,\" related Javascript code.\\n\"],[7,\"ol\"],[9],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"Import the \"],[7,\"code\"],[9],[0,\"maximilian.js\"],[10],[0,\" library using a \"],[7,\"code\"],[9],[0,\"script\"],[10],[0,\" tag\"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"Start the audio engine using the \"],[7,\"code\"],[9],[0,\"initAudioEngine()\"],[10],[0,\" function. This returns a \"],[7,\"code\"],[9],[0,\"Promise\"],[10],[0,\" that contains the main \"],[7,\"strong\"],[9],[0,\"audioEngine\"],[10],[0,\".\"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"Tell the audio engine (\"],[7,\"code\"],[9],[0,\"maxi\"],[10],[0,\") where to get the audio code from using the \"],[7,\"code\"],[9],[0,\"setAudioCode()\"],[10],[0,\" function\"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"div\"],[11,\"class\",\"snippet\"],[9],[0,\"\\n   \"],[7,\"pre\"],[9],[0,\"      \"],[7,\"code\"],[11,\"class\",\"javascript\"],[9],[0,\"\\n        <script src = \\\"https://mimicproject.com/libs/maximilian.v.0.1.js\\\"></script>\\n      \"],[10],[0,\"\\n    \"],[10],[0,\"\"],[10],[0,\"\\n\"],[7,\"div\"],[11,\"class\",\"snippet\"],[9],[0,\"\\n   \"],[7,\"pre\"],[9],[0,\"      \"],[7,\"code\"],[11,\"class\",\"javascript\"],[9],[0,\"\\n        let maxi;\\n        initAudioEngine().then((audioEngine)=>{\\n           maxi = audioEngine;\\n           maxi.setAudioCode(\\\"myAudioScript\\\");\\n         })\\n       \"],[10],[0,\"\\n    \"],[10],[0,\"\"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"strong\"],[9],[0,\"Pro Tip\"],[10],[0,\": You can also pass in a \"],[7,\"strong\"],[9],[0,\"URL\"],[10],[0,\" that returns some audio code, or just pass in a \"],[7,\"code\"],[9],[0,\"literal String\"],[10],[0,\" of the audio code you want to run.\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-heading\"],[9],[0,\"\\n  Communicating between Threads\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  One downside of this new implementation is that its slightly more complex to communicate between your audio \"],[7,\"code\"],[9],[0,\"Maximilian.js\"],[10],[0,\" code on the audio thread, and your other Javascript code. Luckily, we have some pretty simple additions to make this as smooth as possible\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  Here we have updated the example above so that the \"],[7,\"strong\"],[9],[0,\"frequency of the oscillators\"],[10],[0,\" is controlled by the \"],[7,\"strong\"],[9],[0,\"Mouse X coordinate\"],[10],[0,\".\\n\"],[10],[0,\"\\n\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"width\",\"height\"],[\"efd811e7-3880-fe1e-55e3-a9a36c51fe5a\",\"250px\",\"600px\"]]],false],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  On the main Javascript side, we collect the data (in this case the mouse position), and use \"],[7,\"code\"],[9],[0,\"maxi.send()\"],[10],[0,\" to send it to the audio thread. We do this by specifying an\\n  \"],[7,\"ol\"],[9],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"ID (so we can pick it up on the other side)\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"An array of floats (the values we want to send)\"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"div\"],[11,\"class\",\"snippet\"],[9],[0,\"\\n   \"],[7,\"pre\"],[9],[0,\"      \"],[7,\"code\"],[11,\"class\",\"javascript\"],[9],[0,\"\\n        var onMouseMove = (e) => {\\n          const x = e.pageX/window.innerWidth;\\n          //Send data to audio worklet\\n          maxi.send(\\\"fromMain\\\", [x*2000]);\\n        }\\n        document.addEventListener( 'mousemove', onMouseMove, true )\\n      \"],[10],[0,\"\\n    \"],[10],[0,\"\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  On the audio side, we make an \"],[7,\"code\"],[9],[0,\"Input\"],[10],[0,\" object, telling it the ID of the values we want to recieve. Then, in the \"],[7,\"code\"],[9],[0,\"audio processing loop\"],[10],[0,\" we can call \"],[7,\"code\"],[9],[0,\"input.getValue()\"],[10],[0,\" to retrieve any new values that have been sent through.\\n\"],[10],[0,\"\\n\\n\"],[7,\"div\"],[11,\"class\",\"snippet\"],[9],[0,\"\\n   \"],[7,\"pre\"],[9],[0,\"      \"],[7,\"code\"],[11,\"class\",\"javascript\"],[9],[0,\"\\n        var input = new Input('fromMain');\\n        var osc1 = new Maximilian.maxiOsc();\\n        var osc2= new Maximilian.maxiOsc();\\n        function play() {\\n          //Get data from main thread\\n          var mousex = input.getValue();\\n          return (osc1.saw(mousex) + osc2.saw(mousex+0.5)) * 0.5;\\n        }\\n      \"],[10],[0,\"\\n    \"],[10],[0,\"\"],[10],[0,\"\\n\\n\\n\\n\"],[7,\"h1\"],[9],[0,\"Reference\"],[10],[0,\"\\n\\n\"],[7,\"h2\"],[9],[0,\"maxi\"],[10],[0,\"\\n\\n\"],[7,\"h3\"],[9],[0,\"methods\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"setAudioCode(scriptTag | url | stringLiteral)\"],[10],[0,\"\\n\\n  \"],[7,\"br\"],[9],[10],[0,\"Supply the Maximilian.js audio code\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n  \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[10],[0,\"You can specify \"],[7,\"strong\"],[9],[0,\"1\"],[10],[0,\" of the following:\\n  \"],[7,\"ul\"],[9],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"The id of a script tag containing the code OR  \"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"The URL of a text document containing the code (or the name of a MIMIC tab) OR\"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"The literal code as a string\"],[10],[0,\"\\n\"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"addSample(name, url)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"Provide name and sample to load\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n  \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"name\"],[10],[0,\": name of the sample (use for reference when playing on in audio code)\\n  \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"url\"],[10],[0,\": URL to .wav file, or base64 encoded version. Can just use filename of asset uploaded to Mimic document.\\n  \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"Returns Promise on completion.\"],[10],[0,\" Samples should be loaded before audio code is run so can be used with \"],[7,\"code\"],[9],[0,\"await\"],[10],[0,\". See example below\\n  \"],[7,\"br\"],[9],[10],[0,\"\\n  \"],[7,\"pre\"],[9],[0,\"     \"],[7,\"code\"],[11,\"class\",\"javascript\"],[9],[0,\"\\n       await maxi.addSample(\\\"drumBreak\\\",\\\"drill.wav\\\")\\n       //Get audio code from script element\\n       maxi.setAudioCode(\\\"myAudioScript\\\");\\n     \"],[10],[0,\"\\n   \"],[10],[0,\"  \"],[10],[0,\"\\n\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"width\",\"height\"],[\"64b9a233-f617-8f64-b843-2c323e6336bc\",\"250px\",\"600px\"]]],false],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"send(name, values)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"Send data to the audio thread\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n  \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"name\"],[10],[0,\": Tag the values with a name (for use with \"],[7,\"code\"],[9],[0,\"Input()\"],[10],[0,\" on the audio thread)\\n  \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"values\"],[10],[0,\": An array of floating point numbers to send\\n  \"],[10],[0,\"\\n\\n\"],[10],[0,\"\\n\\n\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"connectMediaStream()\"],[10],[0,\"\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"Asks permission to use microphone input in browser\\n  \"],[7,\"br\"],[9],[10],[0,\"Inputs is supplied as an argument to the play() function\\n  \"],[7,\"br\"],[9],[10],[0,\"\\n  \"],[7,\"pre\"],[9],[0,\"     \"],[7,\"code\"],[11,\"class\",\"javascript\"],[9],[0,\"\\n       function play(inputs) {\\n         return inputs * osc.sinewave(200)\\n       }\\n     \"],[10],[0,\"\\n   \"],[10],[0,\" \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"width\",\"height\"],[\"254115a6-8ddf-ad16-76a3-01d68c77f9cd\",\"250px\",\"600px\"]]],false],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"play()\"],[10],[0,\"\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"Toggles play / pause of audio (suspends / resumes audio node)\\n \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"hush()\"],[10],[0,\"\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"Stops playback (suspends audio node)\\n \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"h3\"],[9],[0,\"properties\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"audioWorkletNode.context\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"This is the webaudio context used by the maximilian.js audio engine\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"audioWorkletNode\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"This is the webaudio node that carries out audio processing in maximilian.js.  You can connect this to other webaudio nodes (for a example a spectral analyser)\\n\"],[10],[0,\"\\n\\n\\n\\n\\n\\n\"],[7,\"h2\"],[9],[0,\"maxiOsc\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nAn oscillator with methods for a number of waveforms\\n\"],[10],[0,\"\\n\\n\"],[7,\"h3\"],[9],[0,\"methods\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"sinewave(frequency)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"outputs a sine wave at the given frequency between -1.0 & 1.0\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"width\",\"height\"],[\"ba8a4b5b-881c-d01b-6dac-dda27a01147b\",\"250px\",\"600px\"]]],false],[0,\"\\n\"],[10],[0,\"\\n\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"coswave(frequency)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"outputs a cosine wave at the given frequency between -1.0 & 1.0\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"triangle(frequency)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"outputs a triangle wave at the given frequency between -1.0 & 1.0\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"saw(frequency)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"outputs a saw wave at the given frequency between -1.0 & 1.0\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"square(frequency, pulsewidth)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"outputs a square wave at the given frequency and pulsewidth between -1.0 & 1.0\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n  \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"pulsewidth\"],[10],[0,\": in the range 0 to 1\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"phasor(frequency)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"outputs a linear ramp at the given frequency between 0.0 & 1.0\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"phasorBetween(frequency, startPhase, endPhase)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"outputs a linear ramp at the given frequency between 0.0 & 1.0\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"startPhase\"],[10],[0,\": the start value of the ramp, in the range 0 to 1\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"endPhase\"],[10],[0,\": the end value of the ramp, in the range 0 to 1\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"noise()\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"outputs white noise between -1.0 & 1.0\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"phaseReset(phase)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"reset the phase to a specific value\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"phase\"],[10],[0,\": between 0 and 1\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\\n\\n\\n\\n\"],[7,\"h2\"],[9],[0,\"maxiSample\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nPlay and manipulate sound samples.  Load sample data from a url, using \"],[7,\"code\"],[9],[0,\"addSample()\"],[10],[0,\" (see above).\\n\"],[10],[0,\"\\n\\n\"],[7,\"h3\"],[9],[0,\"methods\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"setSample(bufferData)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"Set sample using \"],[7,\"code\"],[9],[0,\"getSampleBuffer(name)\"],[10],[0,\" function name\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n\\n  \"],[7,\"pre\"],[9],[0,\"     \"],[7,\"code\"],[11,\"class\",\"javascript\"],[9],[0,\"\\n       var sample = new Maximilian.maxiSample();\\n       sample.setSample(this.getSampleBuffer('kick123'))\\n     \"],[10],[0,\"\\n   \"],[10],[0,\" \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"playOnZXAtSpeed(trigger,)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"Play sample at a given playback rate, retriggering back to start on zero crossing\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n  \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"trigger\"],[10],[0,\": Trigger signal. Use 1 to just play once, or oscillator to retrigger over time (e.g. for looping). See \"],[7,\"code\"],[9],[0,\"addSample()\"],[10],[0,\" example above.\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"playOnZXAtSpeed(trigger, rate)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"Play sample at a given playback rate, retriggering back to start on zero crossing\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n  \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"trigger\"],[10],[0,\": Trigger signal. Use 1 to just play once, or oscillator to retrigger over time (e.g. for looping). See \"],[7,\"code\"],[9],[0,\"addSample()\"],[10],[0,\" example above.\\n  \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"rate\"],[10],[0,\":Playback rate as proportion of original (e.g 1 is normal, 2 is double)\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"width\",\"height\"],[\"df4ed283-0361-c993-4775-5d119efd5a4c\",\"250px\",\"600px\"]]],false],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"playOnZXAtSpeedFromOffset(trigger, rate, offset)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"Play sample at a given playback rate and given offset, retriggering back to start on zero crossing\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n  \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"trigger\"],[10],[0,\": Trigger signal. Use 1 to just play once, or oscillator to retrigger over time (e.g. for looping). See \"],[7,\"code\"],[9],[0,\"addSample()\"],[10],[0,\" example above.\\n  \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"rate\"],[10],[0,\":Playback rate as proportion of original (e.g 1 is normal, 2 is double)\\n  \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"rate\"],[10],[0,\":Offset of start position proportion of original (e.g between 0 (beginning) and 1 (end))\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"isReady()\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"returns true if sample is loaded\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"getLength()\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"returns the length of the sample in samples\\n\"],[10],[0,\"\\n\\n\\n\"],[7,\"h2\"],[9],[0,\"maxiFilter\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nVarious filters\\n\"],[10],[0,\"\\n\\n\"],[7,\"h3\"],[9],[0,\"methods\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"lores(input, cutoff, resonance) \"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"A lowpass resonant filter\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"input\"],[10],[0,\": a signal\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"cutoff\"],[10],[0,\": the cutoff frequency (Hz)\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"resonance\"],[10],[0,\": from 0 (low resonance) upwards\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"hires(input, cutoff, resonance) \"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"A highpass resonant filter\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"input\"],[10],[0,\": a signal\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"cutoff\"],[10],[0,\": the cutoff frequency (Hz)\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"resonance\"],[10],[0,\": from 0 (low resonance) upwards\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"width\",\"height\"],[\"f307750c-b744-c7ca-d801-bd615eeca155\",\"250px\",\"600px\"]]],false],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"lopass(input, cutoff) \"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"A onepole lowpass filter\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"input\"],[10],[0,\": a signal\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"cutoff\"],[10],[0,\": between 0 and 1\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"width\",\"height\"],[\"915f51c6-ed18-da52-8e4c-0bcec5310ec2\",\"250px\",\"600px\"]]],false],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"hipass(input, cutoff) \"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"A onepole highpass filter\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"input\"],[10],[0,\": a signal\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"cutoff\"],[10],[0,\": between 0 and 1\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\\n\\n\"],[7,\"h2\"],[9],[0,\"maxiSVF\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nA state variable filter\\n\"],[10],[0,\"\\n\\n\"],[7,\"h3\"],[9],[0,\"methods\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"play(input, lowPassMix, highPassMix, bandPassMix, notchMix)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"Process a signal with the filter\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"input\"],[10],[0,\": a signal\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"lowPassMix\"],[10],[0,\": the amount of low pass filtering, between 0 and 1\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"highPassMix\"],[10],[0,\": the amount of high pass filtering, between 0 and 1\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"bandPassMix\"],[10],[0,\": the amount of band pass filtering, between 0 and 1\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"notchMix\"],[10],[0,\": the amount of notch filtering, between 0 and 1\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"setCutoff(frequency)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"The cutoff frequence\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"frequency\"],[10],[0,\": frequency between 20 and 20000, although this filter sounds best below 5000\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"setResonance(amount)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"The amount of resonance\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"amount\"],[10],[0,\": from 0 upwards, starts to ring from 2-3ish, cracks a bit around 10\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"width\",\"height\"],[\"02deb7a0-82d2-65f8-f084-b05e4e669aac\",\"250px\",\"600px\"]]],false],[0,\"\\n\"],[10],[0,\"\\n\\n\\n\\n\\n\"],[7,\"h2\"],[9],[0,\"maxiEnv\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nAn ADSR envelope\\n\"],[10],[0,\"\\n\\n\"],[7,\"h3\"],[9],[0,\"methods\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"setAttack(time)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"The envelope's attack time\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"time\"],[10],[0,\": in milliseconds\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"setDecay(time)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"The envelope's decay time\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"time\"],[10],[0,\": in milliseconds\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"setSustain(level)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"The envelope's sustain level\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"level\"],[10],[0,\": between 0 and 1\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"setRelease(time)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"The envelope's release time\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"time\"],[10],[0,\": in milliseconds\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"adsr(level, trigger)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"Get the next value from the envelope\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"level\"],[10],[0,\": the overall level of the envelope; everything will be scaled by this value\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"trigger\"],[10],[0,\": the envelope will begin attack when set to 1.0 and release when set to 0.0\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"width\",\"height\"],[\"14ce6e50-747a-aaad-c51c-f1ceedbc192a\",\"600px\",\"600px\"]]],false],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"h2\"],[9],[0,\"maxiClock\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  A Clock for sequencing\\n\"],[10],[0,\"\\n\\n\"],[7,\"h3\"],[9],[0,\"methods\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"setTempo(bpm)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"Set the tempo of the clock in bpm\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"bpm\"],[10],[0,\": the tempo of the clock in bpm\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n  \"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n    \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"setTicksPerBeat(ticksPerBeat)\"],[10],[0,\"\\n    \"],[7,\"br\"],[9],[10],[0,\"Set the number of ticks per beat\\n    \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n      \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"ticksPerBeat\"],[10],[0,\": The number of ticks per beat (e.g. 1/16ths is 4 ticks per beat, MIDI clock is 24 ticks per beat)\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"ticker()\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"Call within the \"],[7,\"code\"],[9],[0,\"play()\"],[10],[0,\" function to advance the clock\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[7,\"h3\"],[9],[0,\"properties\"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"tick\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"Call within \"],[7,\"code\"],[9],[0,\"play()\"],[10],[0,\" function. Is \"],[7,\"code\"],[9],[0,\"True\"],[10],[0,\" if current sample is a tick, \"],[7,\"code\"],[9],[0,\"False\"],[10],[0,\" otherwise.\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"playHead\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"Counter with the current playHead position in ticks\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"width\",\"height\"],[\"77cfbfb3-c4dc-ba50-a5f1-a5bee92a3560\",\"600px\",\"600px\"]]],false],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"h2\"],[9],[0,\"maxiDelayline\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  Delay Effect\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[7,\"h3\"],[9],[0,\"methods\"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"dl(input, delayTime, feedback)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"Call on signal in play() function to get delayed signal\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"input\"],[10],[0,\": input signal\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"delayTime\"],[10],[0,\": delay time in samples\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"feedback\"],[10],[0,\": amount of feedback (between 0 and 1)\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"width\",\"height\"],[\"666517ea-b2ff-1e3c-1952-f22e67a5911e\",\"600px\",\"600px\"]]],false],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"h2\"],[9],[0,\"maxiFreeVerb\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n    Reverb effect\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[7,\"h3\"],[9],[0,\"methods\"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"play(input, roomSize, absorption)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"Call on signal in play() function to get delayed signal\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"input\"],[10],[0,\": input signal\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"roomSize\"],[10],[0,\": Room size (0-1)\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"absorption\"],[10],[0,\": Absorption (0-1)\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"width\",\"height\"],[\"8a41dde5-272d-8833-639e-5a5a9f3ebf2c\",\"600px\",\"600px\"]]],false],[0,\"\\n\"],[10],[0,\"\\n\\n\\n\"],[7,\"h2\"],[9],[0,\"maxiFFTAdaptor\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n FFT\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[7,\"h3\"],[9],[0,\"methods\"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"setup(fftSize, hopSize, windowSize)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"Set up the FFT\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"fftSize\"],[10],[0,\":\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"hopSize\"],[10],[0,\":\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"windowSize\"],[10],[0,\":\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"process(signal, mode)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"call on signal in play() loop. Returns true if new values are available\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"signal\"],[10],[0,\":\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"mode\"],[10],[0,\": Maximilian.maxiFFTModes.WITH_POLAR_CONVERSION or Maximilian.maxiFFTModes.NO_POLAR_CONVERSION\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"getMagnitudesAsJSArray()\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"Returns the magnitudes as a javascript array\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"getPhasesAsJSArray()\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"Returns the phases as a javascript array\\n\"],[10],[0,\"\\n\\n\"],[7,\"h2\"],[9],[0,\"maxiIFFTAdaptor\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  Inverse FFT\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"h3\"],[9],[0,\"methods\"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"setup(fftSize, hopSize, windowSize)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"Set up the IFFT\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"fftSize\"],[10],[0,\":\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"hopSize\"],[10],[0,\":\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"windowSize\"],[10],[0,\":\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"process(trigger, mags, phases, mode)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"Call on signal in play() loop to return audio samples\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"trigger\"],[10],[0,\":Set to 1 to start conversion (e.g. when a new FFT window has been processed)\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"mags\"],[10],[0,\":Array of magnitudes (from \"],[7,\"code\"],[9],[0,\"getMagnitudesAsJSArray()\"],[10],[0,\")\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"mags\"],[10],[0,\":Array of phases (from \"],[7,\"code\"],[9],[0,\"getPhasesAsJSArray()\"],[10],[0,\")\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"mode\"],[10],[0,\":What to return: Maximilian.maxiIFFTModes.SPECTRUM or Maximilian.maxiIFFTModes.COMPLEX\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"width\",\"height\"],[\"e37f3ed5-0b40-2397-e926-68d6dc8aa946\",\"600px\",\"600px\"]]],false],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"h2\"],[9],[0,\"\\n maxiMFCCAdaptor\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"h3\"],[9],[0,\"methods\"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"setup(numBins, numFilters, numCoeffs, minFreq, maxFreq)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"Set up the MFCC\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"numBins\"],[10],[0,\":\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"numFilters\"],[10],[0,\":\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"numCoeffs\"],[10],[0,\":\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"minFreq\"],[10],[0,\":\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"maxFreq\"],[10],[0,\":\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"mfcc(powerSpectrum)\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"Get MFCC values from magnitudes (gotten from FFT)\\n  \"],[7,\"div\"],[11,\"style\",\"margin-left:100px\"],[9],[0,\"\\n    \"],[7,\"br\"],[9],[10],[7,\"span\"],[11,\"style\",\"font-family:monospace\"],[9],[0,\"powerSpectrum\"],[10],[0,\":An array of magnitudes gotten from an FFT (\"],[7,\"code\"],[9],[0,\"getMagnitudesAsJSArray()\"],[10],[0,\")\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"width\",\"height\"],[\"867d0e18-81ba-c1ac-da38-50ae90e84b26\",\"600px\",\"600px\"]]],false],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"h2\"],[9],[0,\"Further information\"],[10],[0,\"\\n\\nmaximilian.js is transpiled from C++ code, so it runs with very high efficiency. You can find the source code on github at \"],[7,\"a\"],[11,\"href\",\"https://github.com/micknoise/Maximilian\"],[9],[0,\"https://github.com/micknoise/Maximilian\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/maximillian-guide.hbs" } });
});
;define("ember-share-db/templates/components/merkgenta-guide", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "ViW3Gj3n", "block": "{\"symbols\":[],\"statements\":[[7,\"h1\"],[9],[0,\"Remap the Magenta Generated Kit onto different sounds\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  We use Magenta's \"],[7,\"a\"],[11,\"href\",\"https://github.com/magenta/magenta-js/tree/master/music#musicvae\"],[9],[0,\"MusicVAE\"],[10],[0,\" to generate rhythms and see how they can used in the context of Grime Music. Whilst the model is designed to follow the following standard drum classes, this project stands as a starting point for experiments with using less traditional instrumentation and mappings. What if you used a kick for hihats? Or a kick for everything? Or a man shouting \\\"Yeah\\\" for the kick?.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  As well as changing the mappings, we also experiment with squeezing the hihats from a two bar pattern into one bar. This gives the effect of both quick runs and drop outs stylistically relevant to the genre and shows how you can rework patterns generated from large generic models to fit more specific musical aims.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  You can play around with using different vocal samples for the drums in the sketch below. Or follow the instructions under the project if you want to add your own samples in.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"ul\"],[9],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      36 - Kick\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      38 - Snare\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      42 - Closed Hi Hat\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      46 - Open Hi-Hat\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      45 - low tom\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      48 - mid tom\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      50 - hi tom\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      49 - crash\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n       51 - ride\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"width\",\"height\"],[\"6b362e09-dd11-d5c8-8b42-4777b7779e97\",\"250px\",\"700px\"]]],false],[0,\"\\n\"],[7,\"h2\"],[9],[0,\"Adding Your Own Samples\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[11,\"style\",\"margin:20px;\"],[9],[0,\"\\n  \"],[7,\"ol\"],[9],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"\\n      We are now going to try and edit the code. Click the green \\\"Open Project\\\" button above, then fork this project by clicking the button in the banner over the code editor, you now have your own copy of this project you can edit.\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"\\n      Once you have your own version, you can upload some of your own samples to the project. In the main title header, select the file icon (\\\"Add files to Use\\\").\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"\\n      Open the \\\"loadDrums\\\" tab.\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"\\n      Near the top you will find a dictionary called \\\"urls\\\". This is a collection of names (on the left) and urls for samples (on the right). Add new name:url pairs to this dictionary and when you rerun the project, your samples should appear as options in the drop down menu.\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  This project is also a good point of reference if you want to combine Magenta with Tone.js.\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/merkgenta-guide.hbs" } });
});
;define("ember-share-db/templates/components/mimic-footer", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "7K4O7BPg", "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"id\",\"mimic-footer\"],[9],[0,\"\\n  \"],[7,\"table\"],[11,\"id\",\"footer-table\"],[9],[0,\"\\n    \"],[7,\"tr\"],[9],[0,\"\\n      \"],[7,\"td\"],[11,\"id\",\"footer-contact\"],[9],[0,\"\\n        \"],[7,\"a\"],[11,\"class\",\"footer-link\"],[11,\"href\",\"mailto:mimicprojectinfo@gmail.com\"],[9],[0,\"Contact\"],[10],[0,\"\\n      \"],[10],[0,\"\\n      \"],[7,\"td\"],[9],[0,\"\\n        \"],[7,\"p\"],[11,\"id\",\"footer-copyright\"],[9],[0,\"© MIMIC Project 2019\"],[10],[0,\"\\n      \"],[10],[0,\"\\n      \"],[7,\"td\"],[11,\"id\",\"footer-terms\"],[9],[0,\"\\n        \"],[7,\"a\"],[11,\"class\",\"footer-link\"],[12,\"href\",[29,\"concat\",[[25,[\"ur\"]],\"/terms\"],null]],[9],[0,\"Terms and Conditions\"],[10],[0,\"\\n      \"],[10],[0,\"\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/mimic-footer.hbs" } });
});
;define("ember-share-db/templates/components/mmll-guide", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "67YewFrZ", "block": "{\"symbols\":[],\"statements\":[[7,\"h2\"],[9],[0,\"Part 1: Musical Machine Listening\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nMachine listening is the attempt to make computers hear sound intelligently. We often emulate the human hearing system, though engineering may not mirror human anatomy, and may deviate from physiological function, including purely mathematical algorithms to extract some sort of further information from audio signals. The interest of the MIMIC project is in musical machine listening, that is, the computer understanding of musical audio signals, and the Musical Machine Listening Library introduced here (subsequently MMLL) is a javascript library to do just that, in the web browser.\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThe library provides a variety of higher level musical listening facilities for computer music, such as onset detection, chord detection, beat tracking and auditory modelling. All the listening objects can run live, to benefit the creation of interative music systems and live electronic music compositions. They can also render audio faster than realtime if called outside of a live processing callback, suitable for the analysis of audio files for machine learning purposes. The library also includes analysis and resynthesis capability from the inverse Fourier transform and via the tracking phase vocoder (which identifies sinusoidal partial trails within audio signals).\\n\"],[10],[0,\"\\n\\n\"],[7,\"h2\"],[9],[0,\"Part 2: Feature Extracting\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThe first embeded example here is a feature extractor from live audio. You can choose as input either a sound file from your hard drive, or an attached microphone. Note that you will need to give permission for the microphone to run within a web browser, for security reasons. A single feature is extracted, the Sensory Dissonance (how rough sounding tha audio is, according to a perceptual model). If you selected an audio file, it will play back, but if you selected microphone the output audio will be silent to avoid feedback.\\n\"],[10],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"height\"],[\"f6a258e2-35c4-6b08-0bbf-07f334de613a\",\"350px\"]]],false],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThe second embeded example is a live spectral view, showing the results of a Fast Fourier Transform of successive snapshots of the input signal. The power spectrum and phase spectrum are both plotted, in linear frequency range. Most of the activity will tend to be on the left of the plot of the power spectrum, for normal audio sources, whose spectral content tends to drop off for higher frequencies. You can choose the gain for the output to hear or not hear the source signal (the default is silence).\\n\"],[10],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"height\"],[\"38c2887a-f8f3-5959-324c-7c0f176c0db7\",\"400px\"]]],false],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThe third embeded example is an onset detector, which reacts to percussive events in the input signal. If you are using live microphone near a speaker you may find headphones work best, to avoid feedback effects. An onset is indicated by a flashing colour change; changing the threshold adjusts the sensitivity of detection.\\n\"],[10],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"height\"],[\"fcdf62d8-a47b-1ddf-f16a-9cd09b328a65\",\"400px\"]]],false],[0,\"\\n\"],[7,\"h2\"],[9],[0,\"Part 3: Making Music\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nOnce an input sound is analysed, you can synthesize output based on the features, work with machine learning to further classify or process inputs based on the features,and make generally responsive and interactive music systems for concerts, installations, websites, etc\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"Some more developed examples available on codecircle are linked now.\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"Spectral delay based on spectral resynthesis. The input is analysed by FFT, then particular spectral bins can be independently delayed and fed back on themselves to make a diffuse delayed filterbank.\"],[10],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"height\"],[\"d5499af6-f4f3-2683-0c05-b700f1a9f1b1\",\"700px\"]]],false],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"bbcut, based on beat tracking. The input is cut up live into stuttering buffers, with the cut points determined by tracking of the primary metrical level in the music.\"],[10],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"height\"],[\"a9e1808c-8c5e-2634-9f6f-d0197b123b34\",\"600px\"]]],false],[0,\"\\n\"],[7,\"h2\"],[9],[0,\"Part 4: Getting Started With Code\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"The library can be used just for the machine listening objects, used within your own audio callback (e.g., as part of a ScriptProcessorNode), or via a quick set-up frontend that hides Web Audio API details and  has you write setup and audio callback functions analogous to Processing's setup and draw.\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"The latter method is the one explained here, but expert Web Audio API people should find it easy enough to just take the analyzers for their own work. Only including the precompiled MMLL.js file is needed to deploy the library, though from the home directory of the library you can compile it afresh via the shell script provided (it is just a concatenation of the js source files).\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"The typical expectation of a machine listening object is that we are working at 44.1KHz sampling rate and that a mono (single channel) input block of samples will be provided for analysis. The objects deal with accumulating samples ready for processing (often via an FFT) themselves and the user doesn't have to worry about that part. However, objects should cope at other standard sampling rates such as 48KHz, 88.2KHz and 96 KHz, even if performance is sub-optimal (for example, the onset detector was developed based on evaluation over a corpus of 44.1KHz samples, so works best at this home rate).\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  A minimal code example is reproduced below. Note how the machine listener object is prefixed with MMLL, and the SetUp function is passed the sampling rate, needed for initialising the listener. The CallBack is where the main action happens, as each new block of input samples is passed in. The input and output arguments hold MMLLInput and MMLLOutpu objects, which make the channels of input and output audio accessible, as well as a special input.monoinput which is a single channel ready for the listener. If a stereo sound file is loaded or two channel live input requested, the monoinput will be the average of the left and right channels. The output object assumes a stereo output for now, exposing the left and right channel data arrays.\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"  \"],[7,\"code\"],[9],[0,\"\\nvar audioblocksize = 256; //lowest latency possible\\n\\nvar setup = function SetUp(sampleRate) {\\n  sensorydissonance = new MMLLSensoryDissonance(sampleRate);\\n};\\n\\nvar callback = function CallBack(input,output,n) {\\n\\n  var dissonance = sensorydissonance.next(input.monoinput);\\n\\n  console.log(dissonance);\\n\\n  for (i = 0; i < n; ++i) {\\n      output.outputL[i] = input.inputL[i];\\n      output.outputR[i] = input.inputR[i];\\n  }\\n\\n};\\n\\nvar gui = new MMLLBasicGUISetup(callback,setup,audioblocksize,true,true);\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  MMLL was developed by \"],[7,\"a\"],[11,\"href\",\"http://composerprogrammer.com/index.html\"],[9],[0,\"Nick Collins\"],[10],[0,\" as part of the AHRC funded MIMIC project (Musically Intelligent Machines Interacting Creatively). MMLL is released under an MIT license, see the included COPYING.txt file. The source code is available at \"],[7,\"a\"],[11,\"href\",\"https://github.com/sicklincoln/MMLL\"],[9],[0,\"github\"],[10],[0,\" though you can use it straight away from a web page just by linking to the \"],[7,\"a\"],[11,\"href\",\"https://raw.githubusercontent.com/sicklincoln/MMLL/master/MMLL.js\"],[9],[0,\"MMLL.js\"],[10],[0,\" source code file. The Examples folder provides a test example for each listener currently available in the library.\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/mmll-guide.hbs" } });
});
;define("ember-share-db/templates/components/modal-preview-body", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "1kPu7+Cw", "block": "{\"symbols\":[],\"statements\":[[4,\"if\",[[25,[\"options\",\"isImage\"]]],null,{\"statements\":[[7,\"img\"],[11,\"class\",\"preview-image\"],[12,\"src\",[25,[\"options\",\"assetURL\"]]],[9],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"options\",\"isAudio\"]]],null,{\"statements\":[[7,\"audio\"],[11,\"controls\",\"\"],[9],[0,\"\\n \"],[7,\"source\"],[12,\"src\",[25,[\"options\",\"assetURL\"]]],[9],[10],[0,\"\\nYour browser does not support the audio element.\\n\"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"options\",\"isVideo\"]]],null,{\"statements\":[[7,\"video\"],[11,\"class\",\"preview-video\"],[11,\"loop\",\"\"],[11,\"autoplay\",\"\"],[11,\"controls\",\"true\"],[12,\"type\",[25,[\"options\",\"assetType\"]]],[9],[0,\"\\n  \"],[7,\"source\"],[12,\"src\",[25,[\"options\",\"assetURL\"]]],[9],[10],[0,\"\\n  Your browser does not support the video tag.\\n\"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[7,\"a\"],[12,\"href\",[25,[\"options\",\"assetURL\"]]],[9],[0,\"Download\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/modal-preview-body.hbs" } });
});
;define("ember-share-db/templates/components/modals-container/alert", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "UeUfcIP4", "block": "{\"symbols\":[\"modal\"],\"statements\":[[4,\"bs-modal\",null,[[\"position\",\"size\",\"backdropTransitionDuration\",\"renderInPlace\",\"transitionDuration\",\"open\",\"onSubmit\",\"onHide\"],[[25,[\"options\",\"position\"]],[25,[\"options\",\"size\"]],[25,[\"options\",\"backdropTransitionDuration\"]],[25,[\"options\",\"renderInPlace\"]],[25,[\"options\",\"transitionDuration\"]],[25,[\"modalIsOpened\"]],[29,\"action\",[[24,0,[]],\"confirm\"],null],[29,\"action\",[[24,0,[]],\"decline\"],null]]],{\"statements\":[[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,1,[\"header\"]],\"expected `modal.header` to be a contextual component but found a string. Did you mean `(component modal.header)`? ('ember-share-db/templates/components/modals-container/alert.hbs' @ L11:C5) \"],null]],null,{\"statements\":[[4,\"if\",[[25,[\"options\",\"titleComponent\"]]],null,{\"statements\":[[0,\"      \"],[1,[29,\"component\",[[25,[\"options\",\"titleComponent\"]]],[[\"options\"],[[25,[\"options\"]]]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[4,\"bs-modal/header/title\",null,null,{\"statements\":[[1,[25,[\"options\",\"title\"]],false]],\"parameters\":[]},null],[0,\"\\n\"]],\"parameters\":[]}]],\"parameters\":[]},null],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,1,[\"body\"]],\"expected `modal.body` to be a contextual component but found a string. Did you mean `(component modal.body)`? ('ember-share-db/templates/components/modals-container/alert.hbs' @ L21:C5) \"],null]],null,{\"statements\":[[4,\"if\",[[25,[\"options\",\"bodyComponent\"]]],null,{\"statements\":[[0,\"      \"],[1,[29,\"component\",[[25,[\"options\",\"bodyComponent\"]]],[[\"options\"],[[25,[\"options\"]]]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[7,\"p\"],[9],[1,[25,[\"options\",\"body\"]],false],[10],[0,\"\\n\"]],\"parameters\":[]}]],\"parameters\":[]},null],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,1,[\"footer\"]],\"expected `modal.footer` to be a contextual component but found a string. Did you mean `(component modal.footer)`? ('ember-share-db/templates/components/modals-container/alert.hbs' @ L31:C5) \"],null]],null,{\"statements\":[[4,\"if\",[[25,[\"options\",\"footerComponent\"]]],null,{\"statements\":[[0,\"      \"],[1,[29,\"component\",[[25,[\"options\",\"footerComponent\"]]],[[\"options\",\"confirm\"],[[25,[\"options\"]],[29,\"action\",[[24,0,[]],[24,1,[\"submit\"]]],null]]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[7,\"p\"],[9],[1,[25,[\"options\",\"footer\"]],false],[10],[0,\"\\n      \"],[1,[29,\"bs-button\",null,[[\"type\",\"defaultText\",\"active\",\"iconActive\",\"iconInactive\",\"size\",\"onClick\"],[[25,[\"options\",\"confirmButtonType\"]],[25,[\"options\",\"confirm\"]],[25,[\"options\",\"confirmIsActive\"]],[25,[\"options\",\"confirmIconActive\"]],[25,[\"options\",\"confirmIconInactive\"]],[25,[\"options\",\"confirmButtonSize\"]],[29,\"action\",[[24,0,[]],[24,1,[\"submit\"]]],null]]]],false],[0,\"\\n\"]],\"parameters\":[]}]],\"parameters\":[]},null]],\"parameters\":[1]},null]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/modals-container/alert.hbs" } });
});
;define("ember-share-db/templates/components/modals-container/base", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "UBmhxBfm", "block": "{\"symbols\":[\"&default\"],\"statements\":[[15,1]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/modals-container/base.hbs" } });
});
;define("ember-share-db/templates/components/modals-container/check-confirm", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "ppsLDsjE", "block": "{\"symbols\":[\"modal\",\"form\"],\"statements\":[[4,\"bs-modal\",null,[[\"position\",\"size\",\"backdropTransitionDuration\",\"renderInPlace\",\"transitionDuration\",\"open\",\"onSubmit\",\"onHide\"],[[25,[\"options\",\"position\"]],[25,[\"options\",\"size\"]],[25,[\"options\",\"backdropTransitionDuration\"]],[25,[\"options\",\"renderInPlace\"]],[25,[\"options\",\"transitionDuration\"]],[25,[\"modalIsOpened\"]],[29,\"action\",[[24,0,[]],\"confirm\"],null],[29,\"action\",[[24,0,[]],\"decline\"],null]]],{\"statements\":[[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,1,[\"header\"]],\"expected `modal.header` to be a contextual component but found a string. Did you mean `(component modal.header)`? ('ember-share-db/templates/components/modals-container/check-confirm.hbs' @ L11:C5) \"],null]],null,{\"statements\":[[4,\"if\",[[25,[\"options\",\"titleComponent\"]]],null,{\"statements\":[[0,\"      \"],[1,[29,\"component\",[[25,[\"options\",\"titleComponent\"]]],[[\"options\"],[[25,[\"options\"]]]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[4,\"bs-modal/header/title\",null,null,{\"statements\":[[1,[25,[\"options\",\"title\"]],false]],\"parameters\":[]},null],[0,\"\\n\"]],\"parameters\":[]}]],\"parameters\":[]},null],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,1,[\"body\"]],\"expected `modal.body` to be a contextual component but found a string. Did you mean `(component modal.body)`? ('ember-share-db/templates/components/modals-container/check-confirm.hbs' @ L21:C5) \"],null]],null,{\"statements\":[[4,\"if\",[[25,[\"options\",\"bodyComponent\"]]],null,{\"statements\":[[0,\"      \"],[1,[29,\"component\",[[25,[\"options\",\"bodyComponent\"]]],[[\"options\",\"updatePromptValue\"],[[25,[\"options\"]],[29,\"action\",[[24,0,[]],\"updatePromptValue\"],null]]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[7,\"p\"],[9],[1,[25,[\"options\",\"body\"]],false],[10],[0,\"\\n\"],[4,\"bs-form\",null,[[\"model\",\"onSubmit\"],[[24,0,[]],[29,\"action\",[[24,0,[]],\"confirm\"],null]]],{\"statements\":[[0,\"        \"],[1,[29,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,2,[\"element\"]],\"expected `form.element` to be a contextual component but found a string. Did you mean `(component form.element)`? ('ember-share-db/templates/components/modals-container/check-confirm.hbs' @ L31:C10) \"],null]],[[\"controlType\",\"property\",\"label\"],[\"checkbox\",\"promptValue\",[25,[\"options\",\"inputLabel\"]]]]],false],[0,\"\\n\"]],\"parameters\":[2]},null]],\"parameters\":[]}]],\"parameters\":[]},null],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,1,[\"footer\"]],\"expected `modal.footer` to be a contextual component but found a string. Did you mean `(component modal.footer)`? ('ember-share-db/templates/components/modals-container/check-confirm.hbs' @ L35:C5) \"],null]],null,{\"statements\":[[4,\"if\",[[25,[\"options\",\"footerComponent\"]]],null,{\"statements\":[[0,\"      \"],[1,[29,\"component\",[[25,[\"options\",\"footerComponent\"]]],[[\"options\",\"confirmDisabled\",\"confirm\",\"decline\"],[[25,[\"options\"]],[25,[\"confirmDisabled\"]],[29,\"action\",[[24,0,[]],[24,1,[\"submit\"]]],null],[29,\"action\",[[24,0,[]],[24,1,[\"close\"]]],null]]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[7,\"p\"],[9],[1,[25,[\"options\",\"footer\"]],false],[10],[0,\"\\n      \"],[1,[29,\"bs-button\",null,[[\"type\",\"defaultText\",\"active\",\"iconActive\",\"iconInactive\",\"size\",\"onClick\"],[[25,[\"options\",\"declineButtonType\"]],[25,[\"options\",\"decline\"]],[25,[\"options\",\"declineIsActive\"]],[25,[\"options\",\"declineIconActive\"]],[25,[\"options\",\"declineIconInactive\"]],[25,[\"options\",\"declineButtonSize\"]],[29,\"action\",[[24,0,[]],[24,1,[\"close\"]]],null]]]],false],[0,\"\\n      \"],[1,[29,\"bs-button\",null,[[\"type\",\"disabled\",\"defaultText\",\"active\",\"size\",\"iconActive\",\"iconInactive\",\"onClick\"],[[25,[\"options\",\"confirmButtonType\"]],[25,[\"confirmDisabled\"]],[25,[\"options\",\"confirm\"]],[25,[\"options\",\"confirmIsActive\"]],[25,[\"options\",\"confirmButtonSize\"]],[25,[\"options\",\"confirmIconActive\"]],[25,[\"options\",\"confirmIconInactive\"]],[29,\"action\",[[24,0,[]],[24,1,[\"submit\"]]],null]]]],false],[0,\"\\n\"]],\"parameters\":[]}]],\"parameters\":[]},null]],\"parameters\":[1]},null]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/modals-container/check-confirm.hbs" } });
});
;define("ember-share-db/templates/components/modals-container/confirm", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "rIw+apcm", "block": "{\"symbols\":[\"modal\"],\"statements\":[[4,\"bs-modal\",null,[[\"position\",\"size\",\"backdropTransitionDuration\",\"renderInPlace\",\"transitionDuration\",\"open\",\"onSubmit\",\"onHide\"],[[25,[\"options\",\"position\"]],[25,[\"options\",\"size\"]],[25,[\"options\",\"backdropTransitionDuration\"]],[25,[\"options\",\"renderInPlace\"]],[25,[\"options\",\"transitionDuration\"]],[25,[\"modalIsOpened\"]],[29,\"action\",[[24,0,[]],\"confirm\"],null],[29,\"action\",[[24,0,[]],\"decline\"],null]]],{\"statements\":[[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,1,[\"header\"]],\"expected `modal.header` to be a contextual component but found a string. Did you mean `(component modal.header)`? ('ember-share-db/templates/components/modals-container/confirm.hbs' @ L11:C5) \"],null]],null,{\"statements\":[[4,\"if\",[[25,[\"options\",\"titleComponent\"]]],null,{\"statements\":[[0,\"      \"],[1,[29,\"component\",[[25,[\"options\",\"titleComponent\"]]],[[\"options\"],[[25,[\"options\"]]]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[4,\"bs-modal/header/title\",null,null,{\"statements\":[[1,[25,[\"options\",\"title\"]],false]],\"parameters\":[]},null],[0,\"\\n\"]],\"parameters\":[]}]],\"parameters\":[]},null],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,1,[\"body\"]],\"expected `modal.body` to be a contextual component but found a string. Did you mean `(component modal.body)`? ('ember-share-db/templates/components/modals-container/confirm.hbs' @ L21:C5) \"],null]],null,{\"statements\":[[4,\"if\",[[25,[\"options\",\"bodyComponent\"]]],null,{\"statements\":[[0,\"      \"],[1,[29,\"component\",[[25,[\"options\",\"bodyComponent\"]]],[[\"options\"],[[25,[\"options\"]]]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[7,\"p\"],[9],[1,[25,[\"options\",\"body\"]],false],[10],[0,\"\\n\"]],\"parameters\":[]}]],\"parameters\":[]},null],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,1,[\"footer\"]],\"expected `modal.footer` to be a contextual component but found a string. Did you mean `(component modal.footer)`? ('ember-share-db/templates/components/modals-container/confirm.hbs' @ L31:C5) \"],null]],null,{\"statements\":[[4,\"if\",[[25,[\"options\",\"footerComponent\"]]],null,{\"statements\":[[0,\"      \"],[1,[29,\"component\",[[25,[\"options\",\"footerComponent\"]]],[[\"options\",\"confirm\",\"decline\"],[[25,[\"options\"]],[29,\"action\",[[24,0,[]],[24,1,[\"submit\"]]],null],[29,\"action\",[[24,0,[]],[24,1,[\"close\"]]],null]]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[7,\"p\"],[9],[1,[25,[\"options\",\"footer\"]],false],[10],[0,\"\\n      \"],[1,[29,\"bs-button\",null,[[\"type\",\"defaultText\",\"active\",\"iconActive\",\"iconInactive\",\"size\",\"onClick\"],[[25,[\"options\",\"declineButtonType\"]],[25,[\"options\",\"decline\"]],[25,[\"options\",\"declineIsActive\"]],[25,[\"options\",\"declineIconActive\"]],[25,[\"options\",\"declineIconInactive\"]],[25,[\"options\",\"declineButtonSize\"]],[29,\"action\",[[24,0,[]],[24,1,[\"close\"]]],null]]]],false],[0,\"\\n      \"],[1,[29,\"bs-button\",null,[[\"type\",\"defaultText\",\"active\",\"iconActive\",\"size\",\"iconInactive\",\"onClick\"],[[25,[\"options\",\"confirmButtonType\"]],[25,[\"options\",\"confirm\"]],[25,[\"options\",\"confirmIsActive\"]],[25,[\"options\",\"confirmIconActive\"]],[25,[\"options\",\"confirmButtonSize\"]],[25,[\"options\",\"confirmIconInactive\"]],[29,\"action\",[[24,0,[]],[24,1,[\"submit\"]]],null]]]],false],[0,\"\\n\"]],\"parameters\":[]}]],\"parameters\":[]},null]],\"parameters\":[1]},null]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/modals-container/confirm.hbs" } });
});
;define("ember-share-db/templates/components/modals-container/process", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "dzXEx1WM", "block": "{\"symbols\":[\"modal\"],\"statements\":[[4,\"bs-modal\",null,[[\"position\",\"size\",\"backdropTransitionDuration\",\"renderInPlace\",\"transitionDuration\",\"open\",\"keyboard\",\"backdropClose\",\"onSubmit\",\"onHide\"],[[25,[\"options\",\"position\"]],[25,[\"options\",\"size\"]],[25,[\"options\",\"backdropTransitionDuration\"]],[25,[\"options\",\"renderInPlace\"]],[25,[\"options\",\"transitionDuration\"]],[25,[\"modalIsOpened\"]],false,false,[29,\"action\",[[24,0,[]],\"confirm\"],null],[29,\"action\",[[24,0,[]],\"decline\"],null]]],{\"statements\":[[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,1,[\"header\"]],\"expected `modal.header` to be a contextual component but found a string. Did you mean `(component modal.header)`? ('ember-share-db/templates/components/modals-container/process.hbs' @ L13:C5) \"],null]],[[\"closeButton\"],[false]],{\"statements\":[[4,\"if\",[[25,[\"options\",\"titleComponent\"]]],null,{\"statements\":[[0,\"      \"],[1,[29,\"component\",[[25,[\"options\",\"titleComponent\"]]],[[\"options\"],[[25,[\"options\"]]]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[4,\"bs-modal/header/title\",null,null,{\"statements\":[[1,[25,[\"options\",\"title\"]],false]],\"parameters\":[]},null],[0,\"\\n\"]],\"parameters\":[]}]],\"parameters\":[]},null],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,1,[\"body\"]],\"expected `modal.body` to be a contextual component but found a string. Did you mean `(component modal.body)`? ('ember-share-db/templates/components/modals-container/process.hbs' @ L23:C5) \"],null]],null,{\"statements\":[[4,\"if\",[[25,[\"options\",\"bodyComponent\"]]],null,{\"statements\":[[0,\"      \"],[1,[29,\"component\",[[25,[\"options\",\"bodyComponent\"]]],[[\"options\"],[[25,[\"options\"]]]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[7,\"p\"],[9],[1,[25,[\"options\",\"body\"]],false],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"options\",\"iconClass\"]]],null,{\"statements\":[[0,\"        \"],[7,\"p\"],[11,\"class\",\"text-center\"],[9],[7,\"i\"],[12,\"class\",[25,[\"options\",\"iconClass\"]]],[9],[10],[10],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[]}]],\"parameters\":[]},null],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,1,[\"footer\"]],\"expected `modal.footer` to be a contextual component but found a string. Did you mean `(component modal.footer)`? ('ember-share-db/templates/components/modals-container/process.hbs' @ L36:C5) \"],null]],null,{\"statements\":[[4,\"if\",[[25,[\"options\",\"footerComponent\"]]],null,{\"statements\":[[0,\"      \"],[1,[29,\"component\",[[25,[\"options\",\"footerComponent\"]]],[[\"options\"],[[25,[\"options\"]]]]],false],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[]},null]],\"parameters\":[1]},null]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/modals-container/process.hbs" } });
});
;define("ember-share-db/templates/components/modals-container/progress", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "/uauz/Eo", "block": "{\"symbols\":[\"modal\",\"p\"],\"statements\":[[4,\"bs-modal\",null,[[\"position\",\"size\",\"backdropTransitionDuration\",\"renderInPlace\",\"transitionDuration\",\"open\",\"keyboard\",\"backdropClose\",\"onSubmit\",\"onHide\"],[[25,[\"options\",\"position\"]],[25,[\"options\",\"size\"]],[25,[\"options\",\"backdropTransitionDuration\"]],[25,[\"options\",\"renderInPlace\"]],[25,[\"options\",\"transitionDuration\"]],[25,[\"modalIsOpened\"]],false,false,[29,\"action\",[[24,0,[]],\"confirm\"],null],[29,\"action\",[[24,0,[]],\"decline\"],null]]],{\"statements\":[[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,1,[\"header\"]],\"expected `modal.header` to be a contextual component but found a string. Did you mean `(component modal.header)`? ('ember-share-db/templates/components/modals-container/progress.hbs' @ L13:C5) \"],null]],[[\"closeButton\"],[false]],{\"statements\":[[4,\"if\",[[25,[\"options\",\"titleComponent\"]]],null,{\"statements\":[[0,\"      \"],[1,[29,\"component\",[[25,[\"options\",\"titleComponent\"]]],[[\"options\"],[[25,[\"options\"]]]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[4,\"bs-modal/header/title\",null,null,{\"statements\":[[1,[25,[\"options\",\"title\"]],false]],\"parameters\":[]},null],[0,\"\\n\"]],\"parameters\":[]}]],\"parameters\":[]},null],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,1,[\"body\"]],\"expected `modal.body` to be a contextual component but found a string. Did you mean `(component modal.body)`? ('ember-share-db/templates/components/modals-container/progress.hbs' @ L23:C5) \"],null]],null,{\"statements\":[[4,\"if\",[[25,[\"options\",\"bodyComponent\"]]],null,{\"statements\":[[0,\"      \"],[1,[29,\"component\",[[25,[\"options\",\"bodyComponent\"]]],[[\"options\",\"progress\",\"done\",\"overall\"],[[25,[\"options\"]],[25,[\"progress\"]],[25,[\"done\"]],[25,[\"promisesCount\"]]]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[7,\"p\"],[9],[1,[25,[\"options\",\"body\"]],false],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"promisesCount\"]]],null,{\"statements\":[[4,\"bs-progress\",null,null,{\"statements\":[[0,\"          \"],[1,[29,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,2,[\"bar\"]],\"expected `p.bar` to be a contextual component but found a string. Did you mean `(component p.bar)`? ('ember-share-db/templates/components/modals-container/progress.hbs' @ L36:C12) \"],null]],[[\"value\",\"showLabel\",\"striped\",\"animate\",\"type\"],[[25,[\"progress\"]],[25,[\"options\",\"showLabel\"]],[25,[\"options\",\"striped\"]],[25,[\"options\",\"animate\"]],[25,[\"options\",\"type\"]]]]],false],[0,\"\\n\"]],\"parameters\":[2]},null]],\"parameters\":[]},null]],\"parameters\":[]}]],\"parameters\":[]},null],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,1,[\"footer\"]],\"expected `modal.footer` to be a contextual component but found a string. Did you mean `(component modal.footer)`? ('ember-share-db/templates/components/modals-container/progress.hbs' @ L47:C5) \"],null]],null,{\"statements\":[[4,\"if\",[[25,[\"options\",\"footerComponent\"]]],null,{\"statements\":[[0,\"      \"],[1,[29,\"component\",[[25,[\"options\",\"footerComponent\"]]],[[\"options\"],[[25,[\"options\"]]]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[25,[\"options\",\"cancelable\"]]],null,{\"statements\":[[0,\"        \"],[4,\"bs-button\",null,[[\"onClick\",\"disabled\"],[[29,\"action\",[[24,0,[]],\"cancel\"],null],[25,[\"canceled\"]]]],{\"statements\":[[1,[25,[\"options\",\"cancel\"]],false]],\"parameters\":[]},null],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[]}]],\"parameters\":[]},null]],\"parameters\":[1]},null]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/modals-container/progress.hbs" } });
});
;define("ember-share-db/templates/components/modals-container/prompt-confirm", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "QvDMfqqt", "block": "{\"symbols\":[\"modal\",\"form\"],\"statements\":[[4,\"bs-modal\",null,[[\"position\",\"size\",\"backdropTransitionDuration\",\"renderInPlace\",\"transitionDuration\",\"open\",\"onSubmit\",\"onHide\"],[[25,[\"options\",\"position\"]],[25,[\"options\",\"size\"]],[25,[\"options\",\"backdropTransitionDuration\"]],[25,[\"options\",\"renderInPlace\"]],[25,[\"options\",\"transitionDuration\"]],[25,[\"modalIsOpened\"]],[29,\"action\",[[24,0,[]],\"confirm\"],null],[29,\"action\",[[24,0,[]],\"decline\"],null]]],{\"statements\":[[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,1,[\"header\"]],\"expected `modal.header` to be a contextual component but found a string. Did you mean `(component modal.header)`? ('ember-share-db/templates/components/modals-container/prompt-confirm.hbs' @ L11:C5) \"],null]],null,{\"statements\":[[4,\"if\",[[25,[\"options\",\"titleComponent\"]]],null,{\"statements\":[[0,\"      \"],[1,[29,\"component\",[[25,[\"options\",\"titleComponent\"]]],[[\"options\"],[[25,[\"options\"]]]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[4,\"bs-modal/header/title\",null,[[\"title\"],[[25,[\"options\",\"title\"]]]],{\"statements\":[[1,[25,[\"options\",\"title\"]],false]],\"parameters\":[]},null],[0,\"\\n\"]],\"parameters\":[]}]],\"parameters\":[]},null],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,1,[\"body\"]],\"expected `modal.body` to be a contextual component but found a string. Did you mean `(component modal.body)`? ('ember-share-db/templates/components/modals-container/prompt-confirm.hbs' @ L21:C5) \"],null]],null,{\"statements\":[[4,\"if\",[[25,[\"options\",\"bodyComponent\"]]],null,{\"statements\":[[0,\"      \"],[1,[29,\"component\",[[25,[\"options\",\"bodyComponent\"]]],[[\"options\",\"updatePromptValue\"],[[25,[\"options\"]],[29,\"action\",[[24,0,[]],\"updatePromptValue\"],null]]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[7,\"p\"],[9],[1,[25,[\"options\",\"body\"]],false],[10],[0,\"\\n\"],[4,\"bs-form\",null,[[\"model\",\"onSubmit\"],[[24,0,[]],[29,\"action\",[[24,0,[]],\"confirm\"],null]]],{\"statements\":[[0,\"        \"],[1,[29,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,2,[\"element\"]],\"expected `form.element` to be a contextual component but found a string. Did you mean `(component form.element)`? ('ember-share-db/templates/components/modals-container/prompt-confirm.hbs' @ L31:C10) \"],null]],[[\"property\",\"label\"],[\"promptValue\",[25,[\"options\",\"inputLabel\"]]]]],false],[0,\"\\n\"]],\"parameters\":[2]},null]],\"parameters\":[]}]],\"parameters\":[]},null],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,1,[\"footer\"]],\"expected `modal.footer` to be a contextual component but found a string. Did you mean `(component modal.footer)`? ('ember-share-db/templates/components/modals-container/prompt-confirm.hbs' @ L35:C5) \"],null]],null,{\"statements\":[[4,\"if\",[[25,[\"options\",\"footerComponent\"]]],null,{\"statements\":[[0,\"      \"],[1,[29,\"component\",[[25,[\"options\",\"footerComponent\"]]],[[\"options\",\"confirmDisabled\",\"confirm\",\"decline\"],[[25,[\"options\"]],[25,[\"confirmDisabled\"]],[29,\"action\",[[24,0,[]],[24,1,[\"submit\"]]],null],[29,\"action\",[[24,0,[]],[24,1,[\"close\"]]],null]]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[7,\"p\"],[9],[1,[25,[\"options\",\"footer\"]],false],[10],[0,\"\\n      \"],[1,[29,\"bs-button\",null,[[\"type\",\"defaultText\",\"active\",\"iconActive\",\"iconInactive\",\"size\",\"onClick\"],[[25,[\"options\",\"declineButtonType\"]],[25,[\"options\",\"decline\"]],[25,[\"options\",\"declineIsActive\"]],[25,[\"options\",\"declineIconActive\"]],[25,[\"options\",\"declineIconInactive\"]],[25,[\"options\",\"declineButtonSize\"]],[29,\"action\",[[24,0,[]],[24,1,[\"close\"]]],null]]]],false],[0,\"\\n      \"],[1,[29,\"bs-button\",null,[[\"type\",\"defaultText\",\"disabled\",\"active\",\"iconActive\",\"iconInactive\",\"size\",\"onClick\"],[[25,[\"options\",\"confirmButtonType\"]],[25,[\"options\",\"confirm\"]],[25,[\"confirmDisabled\"]],[25,[\"options\",\"confirmIsActive\"]],[25,[\"options\",\"confirmIconActive\"]],[25,[\"options\",\"confirmIconInactive\"]],[25,[\"options\",\"confirmButtonSize\"]],[29,\"action\",[[24,0,[]],[24,1,[\"submit\"]]],null]]]],false],[0,\"\\n\"]],\"parameters\":[]}]],\"parameters\":[]},null]],\"parameters\":[1]},null]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/modals-container/prompt-confirm.hbs" } });
});
;define("ember-share-db/templates/components/modals-container/prompt", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "5b+8gF4E", "block": "{\"symbols\":[\"modal\",\"form\"],\"statements\":[[4,\"bs-modal\",null,[[\"position\",\"size\",\"backdropTransitionDuration\",\"renderInPlace\",\"transitionDuration\",\"open\",\"onSubmit\",\"onHide\"],[[25,[\"options\",\"position\"]],[25,[\"options\",\"size\"]],[25,[\"options\",\"backdropTransitionDuration\"]],[25,[\"options\",\"renderInPlace\"]],[25,[\"options\",\"transitionDuration\"]],[25,[\"modalIsOpened\"]],[29,\"action\",[[24,0,[]],\"confirm\"],null],[29,\"action\",[[24,0,[]],\"decline\"],null]]],{\"statements\":[[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,1,[\"header\"]],\"expected `modal.header` to be a contextual component but found a string. Did you mean `(component modal.header)`? ('ember-share-db/templates/components/modals-container/prompt.hbs' @ L11:C5) \"],null]],null,{\"statements\":[[4,\"if\",[[25,[\"options\",\"titleComponent\"]]],null,{\"statements\":[[0,\"      \"],[1,[29,\"component\",[[25,[\"options\",\"titleComponent\"]]],[[\"options\"],[[25,[\"options\"]]]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[4,\"bs-modal/header/title\",null,null,{\"statements\":[[1,[25,[\"options\",\"title\"]],false]],\"parameters\":[]},null],[0,\"\\n\"]],\"parameters\":[]}]],\"parameters\":[]},null],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,1,[\"body\"]],\"expected `modal.body` to be a contextual component but found a string. Did you mean `(component modal.body)`? ('ember-share-db/templates/components/modals-container/prompt.hbs' @ L21:C5) \"],null]],null,{\"statements\":[[4,\"if\",[[25,[\"options\",\"bodyComponent\"]]],null,{\"statements\":[[0,\"      \"],[1,[29,\"component\",[[25,[\"options\",\"bodyComponent\"]]],[[\"options\",\"updatePromptValue\"],[[25,[\"options\"]],[29,\"action\",[[24,0,[]],\"updatePromptValue\"],null]]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[7,\"p\"],[9],[1,[25,[\"options\",\"body\"]],false],[10],[0,\"\\n\"],[4,\"bs-form\",null,[[\"model\",\"onSubmit\"],[[24,0,[]],[29,\"action\",[[24,0,[]],\"confirm\"],null]]],{\"statements\":[[0,\"        \"],[1,[29,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,2,[\"element\"]],\"expected `form.element` to be a contextual component but found a string. Did you mean `(component form.element)`? ('ember-share-db/templates/components/modals-container/prompt.hbs' @ L31:C10) \"],null]],[[\"property\",\"label\"],[\"promptValue\",[25,[\"options\",\"inputLabel\"]]]]],false],[0,\"\\n\"]],\"parameters\":[2]},null]],\"parameters\":[]}]],\"parameters\":[]},null],[4,\"component\",[[29,\"-assert-implicit-component-helper-argument\",[[24,1,[\"footer\"]],\"expected `modal.footer` to be a contextual component but found a string. Did you mean `(component modal.footer)`? ('ember-share-db/templates/components/modals-container/prompt.hbs' @ L35:C5) \"],null]],null,{\"statements\":[[4,\"if\",[[25,[\"options\",\"footerComponent\"]]],null,{\"statements\":[[0,\"      \"],[1,[29,\"component\",[[25,[\"options\",\"footerComponent\"]]],[[\"options\",\"confirmDisabled\",\"confirm\",\"decline\"],[[25,[\"options\"]],[25,[\"confirmDisabled\"]],[29,\"action\",[[24,0,[]],[24,1,[\"submit\"]]],null],[29,\"action\",[[24,0,[]],[24,1,[\"close\"]]],null]]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[7,\"p\"],[9],[1,[25,[\"options\",\"footer\"]],false],[10],[0,\"\\n      \"],[1,[29,\"bs-button\",null,[[\"type\",\"defaultText\",\"active\",\"iconActive\",\"iconInactive\",\"size\",\"onClick\"],[[25,[\"options\",\"declineButtonType\"]],[25,[\"options\",\"decline\"]],[25,[\"options\",\"declineIsActive\"]],[25,[\"options\",\"declineIconActive\"]],[25,[\"options\",\"declineIconInactive\"]],[25,[\"options\",\"declineButtonSize\"]],[29,\"action\",[[24,0,[]],[24,1,[\"close\"]]],null]]]],false],[0,\"\\n      \"],[1,[29,\"bs-button\",null,[[\"type\",\"defaultText\",\"disabled\",\"active\",\"iconActive\",\"iconInactive\",\"size\",\"onClick\"],[[25,[\"options\",\"confirmButtonType\"]],[25,[\"options\",\"confirm\"]],[25,[\"confirmDisabled\"]],[25,[\"options\",\"confirmIsActive\"]],[25,[\"options\",\"confirmIconActive\"]],[25,[\"options\",\"confirmIconInactive\"]],[25,[\"options\",\"confirmButtonSize\"]],[29,\"action\",[[24,0,[]],[24,1,[\"submit\"]]],null]]]],false],[0,\"\\n\"]],\"parameters\":[]}]],\"parameters\":[]},null]],\"parameters\":[1]},null]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/modals-container/prompt.hbs" } });
});
;define("ember-share-db/templates/components/ops-player", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "lAYsSVvI", "block": "{\"symbols\":[],\"statements\":[[7,\"p\"],[11,\"class\",\"side-menu-label\"],[9],[0,\"code player\"],[10],[0,\"\\n\"],[7,\"div\"],[11,\"class\",\"tooltip\"],[9],[0,\"\\n  \"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[0,\"Rewind to Beginning\"],[10],[0,\"\\n  \"],[4,\"bs-button\",null,[[\"class\",\"icon\",\"onClick\",\"__HTML_ATTRIBUTES__\"],[\"clear-btn \",\"glyphicon glyphicon-fast-backward\",[29,\"action\",[[24,0,[]],\"rewind\"],null],[29,\"hash\",null,[[\"aria-label\"],[\"Rewind to Beginning\"]]]]],{\"statements\":[],\"parameters\":[]},null],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"div\"],[11,\"class\",\"tooltip\"],[9],[0,\"\\n  \"],[4,\"bs-button\",null,[[\"class\",\"icon\",\"onClick\",\"__HTML_ATTRIBUTES__\"],[\"clear-btn \",\"glyphicon glyphicon-backward\",[29,\"action\",[[24,0,[]],\"prev\"],null],[29,\"hash\",null,[[\"aria-label\"],[\"step back\"]]]]],{\"statements\":[],\"parameters\":[]},null],[0,\"\\n  \"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[0,\"Step Back\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"div\"],[11,\"class\",\"tooltip\"],[9],[0,\"\\n\"],[4,\"if\",[[25,[\"isPlaying\"]]],null,{\"statements\":[[0,\"    \"],[4,\"bs-button\",null,[[\"class\",\"id\",\"icon\",\"onClick\",\"__HTML_ATTRIBUTES__\"],[\"clear-btn \",\"ops-play-btn\",\"glyphicon glyphicon-pause\",[29,\"action\",[[24,0,[]],\"pause\"],null],[29,\"hash\",null,[[\"aria-label\"],[\"pause op playback\"]]]]],{\"statements\":[],\"parameters\":[]},null],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"    \"],[4,\"bs-button\",null,[[\"class\",\"id\",\"icon\",\"onClick\",\"__HTML_ATTRIBUTES__\"],[\"clear-btn \",\"ops-play-btn\",\"glyphicon glyphicon-play\",[29,\"action\",[[24,0,[]],\"play\"],null],[29,\"hash\",null,[[\"aria-label\"],[\"play ops\"]]]]],{\"statements\":[],\"parameters\":[]},null],[0,\"\\n\"]],\"parameters\":[]}],[0,\"  \"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[0,\"Play to End / Pause\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"div\"],[11,\"class\",\"tooltip\"],[9],[0,\"\\n  \"],[4,\"bs-button\",null,[[\"class\",\"icon\",\"onClick\",\"__HTML_ATTRIBUTES__\"],[\"clear-btn\",\"glyphicon glyphicon-forward\",[29,\"action\",[[24,0,[]],\"next\"],null],[29,\"hash\",null,[[\"aria-label\"],[\"skip op\"]]]]],{\"statements\":[],\"parameters\":[]},null],[0,\"\\n  \"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[0,\"Step Forwards\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/ops-player.hbs" } });
});
;define("ember-share-db/templates/components/people-tile", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "EuYu74vI", "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"role\",\"button\"],[11,\"tabIndex\",\"0\"],[11,\"class\",\"example-tile-container-outer col-xs-12 col-sm-4 col-md-4\"],[12,\"onclick\",[29,\"action\",[[24,0,[]],\"onClick\"],null]],[12,\"onmouseover\",[29,\"action\",[[24,0,[]],\"onover\"],null]],[12,\"onmouseout\",[29,\"action\",[[24,0,[]],\"onout\"],null]],[12,\"onkeypress\",[29,\"action\",[[24,0,[]],\"onClick\"],null]],[9],[0,\"\\n  \"],[7,\"div\"],[11,\"class\",\"people-color\"],[12,\"id\",[23,\"colourId\"]],[9],[0,\"\\n    \"],[7,\"p\"],[11,\"class\",\"person-container\"],[9],[0,\"\\n      \"],[7,\"img\"],[12,\"src\",[25,[\"person\",\"imgURL\"]]],[11,\"class\",\"people-pic\"],[9],[10],[0,\"\\n    \"],[10],[0,\"\\n    \"],[1,[29,\"shape-cell\",null,[[\"isSelected\",\"colourId\",\"svgClass\"],[[25,[\"isSelected\"]],[25,[\"colourId\"]],[25,[\"svgClass\"]]]]],false],[0,\"\\n    \"],[7,\"p\"],[11,\"class\",\"people-name\"],[9],[0,\"\\n      \"],[1,[25,[\"person\",\"name\"]],false],[0,\"\\n    \"],[10],[0,\"\\n    \"],[7,\"p\"],[11,\"class\",\"people-role\"],[9],[0,\"\\n      \"],[1,[25,[\"person\",\"role\"]],false],[0,\"\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/people-tile.hbs" } });
});
;define("ember-share-db/templates/components/project-tabs", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "mjL/6EYp", "block": "{\"symbols\":[\"tab\",\"index\"],\"statements\":[[7,\"div\"],[11,\"id\",\"project-tabs\"],[9],[0,\"\\n  \"],[7,\"table\"],[9],[0,\"\\n   \"],[7,\"tr\"],[9],[0,\"\\n    \"],[7,\"th\"],[9],[0,\"\\n      \"],[1,[29,\"tab-item\",null,[[\"name\",\"id\",\"isSelected\",\"tabIndex\",\"onSelect\",\"onDelete\",\"canDelete\"],[[25,[\"parent\",\"name\"]],[25,[\"parent\",\"id\"]],[25,[\"parent\",\"isSelected\"]],-1,[25,[\"onSelect\"]],[25,[\"onDelete\"]],false]]],false],[0,\"\\n    \"],[10],[0,\"\\n\"],[4,\"each\",[[25,[\"tabs\"]]],null,{\"statements\":[[0,\"    \"],[7,\"th\"],[9],[0,\"\\n      \"],[1,[29,\"tab-item\",null,[[\"name\",\"id\",\"isSelected\",\"tabIndex\",\"onSelect\",\"onDelete\",\"canDelete\"],[[24,1,[\"name\"]],[24,1,[\"id\"]],[24,1,[\"isSelected\"]],[24,2,[]],[25,[\"onSelect\"]],[25,[\"onDelete\"]],[24,1,[\"canDelete\"]]]]],false],[0,\"\\n    \"],[10],[0,\"\\n\"]],\"parameters\":[1,2]},null],[0,\"    \"],[7,\"th\"],[9],[0,\"\\n\"],[4,\"bs-button\",null,[[\"class\",\"role\",\"tabIndex\",\"onClick\",\"icon\",\"__HTML_ATTRIBUTES__\"],[\"add-file-button\",\"button\",\"0\",[29,\"action\",[[24,0,[]],\"createNewDocument\"],null],\"glyphicon glyphicon-plus\",[29,\"hash\",null,[[\"aria-label\"],[\"add tab\"]]]]],{\"statements\":[],\"parameters\":[]},null],[0,\"    \"],[10],[0,\"\\n   \"],[10],[0,\"\\n \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/project-tabs.hbs" } });
});
;define("ember-share-db/templates/components/rapidlib-guide", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "3TdzqjFE", "block": "{\"symbols\":[],\"statements\":[[7,\"script\"],[11,\"src\",\"https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.6/highlight.min.js\"],[9],[10],[0,\"\\n\"],[7,\"link\"],[11,\"rel\",\"stylesheet\"],[11,\"href\",\"https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.6/styles/default.min.css\"],[9],[10],[0,\"\\n\"],[7,\"script\"],[9],[0,\"\\n  hljs.initHighlightingOnLoad();\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  This page provides a minimal guide on how to use the RapidLib.\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"The guide shows how to use simple machine learning objects in five steps.\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"The guide also shows two simple examples of applied Machine Learning tasks.\"],[10],[0,\"\\n\\n\"],[7,\"h2\"],[9],[0,\"1. Add RapidLib to your HTML page \"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"First, to install RapidLib you need to include it in your HTML page using the HTML \"],[7,\"span\"],[11,\"style\",\"font-family: 'Courier New', Courier, monospace;\"],[9],[0,\"<script>\"],[10],[0,\" tag.\"],[10],[0,\"\\n\\n\"],[7,\"div\"],[11,\"class\",\"snippet\"],[9],[0,\"\\n  \"],[7,\"pre\"],[9],[0,\"    \"],[7,\"code\"],[11,\"class\",\"javascript\"],[9],[0,\"\\n        // Just include this script tag in your HTML page\\n\\n        <script src=\\\"https://mimicproject.com/libs/rapidLib.js\\\"></script>\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"Now you have the RapidLib module available on the Javascript global scope.\"],[10],[0,\"\\n\\n\"],[7,\"h2\"],[9],[0,\"2. Load RapidLib to create a Machine Learning object\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"Use \"],[7,\"span\"],[11,\"style\",\"font-family: 'Courier New', Courier, monospace;\"],[9],[0,\"RapidLib()\"],[10],[0,\" to load the RapidLib module into a variable. That variable will give you access to the Machine Learning objects that RapidLib provides.\"],[10],[0,\"\\n\\n\"],[7,\"div\"],[11,\"class\",\"snippet\"],[9],[0,\"\\n  \"],[7,\"pre\"],[9],[0,\"      \"],[7,\"code\"],[11,\"class\",\"javascript\"],[9],[0,\"\\n        var rapidLib = RapidLib();\\n\\n        var myRegression            = new rapidLib.Regression();\\n\\n        var myClassification        = new rapidLib.Classification();\\n\\n        var mySeriesClassification  = new rapidLib.SeriesClassification();\\n      \"],[10],[0,\"\\n    \"],[10],[0,\"\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"RapidLib provides constructors to three main objects: \"],[7,\"span\"],[11,\"style\",\"font-family: 'Courier New', Courier, monospace;\"],[9],[0,\"Regression\"],[10],[0,\", \"],[7,\"span\"],[11,\"style\",\"font-family: 'Courier New', Courier, monospace;\"],[9],[0,\"Classification\"],[10],[0,\" and \"],[7,\"span\"],[11,\"style\",\"font-family: 'Courier New', Courier, monospace;\"],[9],[0,\"SeriesClassification\"],[10],[0,\".\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"You can apply each one of these objects to a specific Machine Learning task.\"],[10],[0,\"\\n\\n\"],[7,\"h2\"],[9],[0,\"3. Create a data set \"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"To apply a Machine Learning task such as training a \"],[7,\"strong\"],[9],[0,\"regression\"],[10],[0,\" model, you need data and a data\\n  structure that holds it—this is usually called a \"],[7,\"strong\"],[9],[0,\"data set\"],[10],[0,\".\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"The \"],[7,\"span\"],[11,\"style\",\"font-family: 'Courier New', Courier, monospace;\"],[9],[0,\"Regression\"],[10],[0,\" and \"],[7,\"span\"],[11,\"style\",\"font-family: 'Courier New', Courier, monospace;\"],[9],[0,\"Classification\"],[10],[0,\" objects expect a\\n  certain structure from a \"],[7,\"strong\"],[9],[0,\"data set\"],[10],[0,\" object, as you can see in the example below.\\n\"],[10],[0,\"\\n\\n\"],[7,\"div\"],[11,\"class\",\"snippet\"],[9],[0,\"\\n  \"],[7,\"pre\"],[9],[0,\"      \"],[7,\"code\"],[11,\"class\",\"javascript\"],[9],[0,\"\\n        var myData = [\\n          {\\n            input:  [48],\\n            output: [130.81]\\n          },\\n          {\\n            input:  [54],\\n            output: [185.00]\\n          },\\n          {\\n            input:  [60],\\n            output: [261.63]\\n          },\\n          {\\n            input:  [66],\\n            output: [369.994]\\n          },\\n          {\\n            input:  [72],\\n            output: [523.25]\\n          }\\n        ];\\n      \"],[10],[0,\"\\n    \"],[10],[0,\"\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[7,\"span\"],[11,\"style\",\"font-family: 'Courier New', Courier, monospace;\"],[9],[0,\"myData\"],[10],[0,\" is a \"],[7,\"strong\"],[9],[0,\"data set\"],[10],[0,\" that contains a list of objects. Each of these\\nobjects is an \"],[7,\"strong\"],[9],[0,\"example\"],[10],[0,\" that contains a list of \"],[7,\"strong\"],[9],[0,\"inputs\"],[10],[0,\" matched to a list of desired\\n\"],[7,\"strong\"],[9],[0,\"outputs\"],[10],[0,\".\"],[10],[0,\"\\n\\n\"],[7,\"div\"],[11,\"class\",\"note\"],[9],[0,\"\\n  \"],[7,\"h3\"],[9],[7,\"strong\"],[9],[0,\"Note:\"],[10],[10],[0,\"\\n  \"],[7,\"ul\"],[9],[0,\"\\n  \"],[7,\"li\"],[9],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[7,\"span\"],[11,\"style\",\"font-family: 'Courier New', Courier, monospace;\"],[9],[0,\"myData\"],[10],[0,\" is implemented as a Javascript Array containing \"],[7,\"strong\"],[9],[0,\"examples\"],[10],[0,\"\\n    that are implemented as Javascript objects.\"],[10],[10],[0,\"\\n  \"],[7,\"li\"],[9],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"Both \"],[7,\"span\"],[11,\"style\",\"font-family: 'Courier New', Courier, monospace;\"],[9],[0,\"input\"],[10],[0,\" and \"],[7,\"span\"],[11,\"style\",\"font-family: 'Courier New', Courier, monospace;\"],[9],[0,\"output\"],[10],[0,\" are\\n    implemented as Javascript Arrays, although the examples in \"],[7,\"span\"],[11,\"style\",\"font-family: 'Courier New', Courier, monospace;\"],[9],[0,\"myData\"],[10],[0,\" match one input\\n    to one output.\"],[10],[10],[0,\"\\n  \"],[7,\"li\"],[9],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"You need to make sure that the number of inputs and outputs \"],[7,\"strong\"],[9],[0,\"remain constant\"],[10],[0,\" for the data sets of\\n    a specific Machine Learning object.\"],[10],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"h2\"],[9],[0,\"4. Train a Machine Learning object with a data set \"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"To train a Machine Learning object, for instance a \"],[7,\"strong\"],[9],[0,\"regression\"],[10],[0,\" object called \"],[7,\"span\"],[11,\"style\",\"font-family: 'Courier New', Courier, monospace;\"],[9],[0,\"myRegression\"],[10],[0,\", you can use the \"],[7,\"span\"],[11,\"style\",\"font-family: 'Courier New', Courier, monospace;\"],[9],[0,\"train()\"],[10],[0,\" method that accepts a\\n\"],[7,\"strong\"],[9],[0,\"data set\"],[10],[0,\" object.\"],[10],[0,\"\\n\\n\"],[7,\"div\"],[11,\"class\",\"snippet\"],[9],[0,\"\\n  \"],[7,\"pre\"],[9],[0,\"    \"],[7,\"code\"],[11,\"class\",\"javascript\"],[9],[0,\"\\n      myRegression.train(myData);\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"Note that the \"],[7,\"span\"],[11,\"style\",\"font-family: 'Courier New', Courier, monospace;\"],[9],[0,\"train()\"],[10],[0,\" method is synchronous and that, to complete, it takes a\\n proportional amount of time to the size of your training data set.\"],[10],[0,\"\\n\\n\"],[7,\"h2\"],[9],[0,\"5. Run a trained Machine Learning object on new data\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"Once your \"],[7,\"strong\"],[9],[0,\"regression\"],[10],[0,\" object is trained, you can run it on new data and get the results of the\\n learned model. \"],[10],[0,\"\\n\\n\"],[7,\"div\"],[11,\"class\",\"snippet\"],[9],[0,\"\\n   \"],[7,\"pre\"],[9],[0,\"      \"],[7,\"code\"],[11,\"class\",\"javascript\"],[9],[0,\"\\n        var newInput = [64];\\n\\n        var output = myRegression.run(newInput);\\n      \"],[10],[0,\"\\n    \"],[10],[0,\"\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"You can either decide to re-train your \"],[7,\"strong\"],[9],[0,\"regression\"],[10],[0,\" object to improve how it works, or to terminate the process.\"],[10],[0,\"\\n\\n\"],[7,\"hr\"],[9],[10],[0,\"\\n\\n\"],[7,\"h2\"],[9],[0,\"Hello World!\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"The next code snippet puts everything together in a simple but complete example.\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"Here we apply the RapidLib to a real machine learning task, training a regression model that converts MIDI values to frequency values.\"],[10],[0,\"\\n\\n\"],[7,\"div\"],[11,\"class\",\"snippet\"],[9],[0,\"\\n   \"],[7,\"pre\"],[9],[0,\"     \"],[7,\"code\"],[11,\"class\",\"javascript\"],[9],[0,\"\\n      <!DOCTYPE html>\\n      <html>\\n      <head> </head>\\n      <body> </body>\\n      <script src=\\\"https://mimicproject.com/libs/rapidLib.js\\\"> </script>\\n\\n      <script>\\n\\n        var rapidLib = RapidLib();\\n\\n        //Create a machine learning object for regression\\n        var midiToFrequencyRegression = new rapidLib.Regression();\\n\\n        //Create a Javascript object to hold your training data\\n        var myData = [\\n          {\\n            input:  [48],\\n            output: [130.81]\\n          },\\n          {\\n            input:  [54],\\n            output: [185.00]\\n          },\\n          {\\n            input:  [60],\\n            output: [261.63]\\n          },\\n          {\\n            input:  [66],\\n            output: [369.994]\\n          },\\n          {\\n            input:  [72],\\n            output: [523.25]\\n          }\\n        ];\\n\\n\\n        //Train a machine learning model with the data\\n        midiToFrequencyRegression.train(myData);\\n\\n        //Create a new input to test the model\\n        var newInput = [64];\\n\\n        //Run the trained model on the new input\\n        var freqHz = midiToFrequencyRegression.run(newInput);\\n\\n        console.log(freqHz); // outputs 333.713, the value of the frequency in Hz\\n\\n      </script>\\n      </html>\\n      \"],[10],[0,\"\\n    \"],[10],[0,\" \"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"Note that in this example, the variable keeping the \"],[7,\"strong\"],[9],[0,\"regression\"],[10],[0,\" object here is named \"],[7,\"span\"],[11,\"style\",\"font-family: 'Courier New', Courier, monospace;\"],[9],[0,\"midiToFrequencyRegression\"],[10],[0,\".\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"The model trained with four examples in the \"],[7,\"span\"],[11,\"style\",\"font-family: 'Courier New', Courier, monospace;\"],[9],[0,\"myData\"],[10],[0,\" data set converts MIDI values\\n  to Frequency values, within the specified range.\"],[10],[0,\"\\n\\n\\n\\n\"],[7,\"hr\"],[9],[10],[0,\"\\n\\n\"],[7,\"h2\"],[9],[0,\"Let's go interactive now!\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"This example is interactive and just a little bit more elaborate.\"],[10],[0,\"\\n\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"width\",\"height\"],[\"a01f1f63-ddbc-3c77-ba73-d58606a7649e\",\"250px\",\"320px\"]]],false],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"If you look more closely, there are a few things going on here:\"],[10],[0,\"\\n\\n\"],[7,\"ul\"],[9],[0,\"\\n  \"],[7,\"li\"],[9],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"Your mouse pointer location as a source of real-time data! Mouse coordinates X and Y are normalised to relative values between \"],[7,\"strong\"],[9],[0,\"0\"],[10],[0,\" and \"],[7,\"strong\"],[9],[0,\"1\"],[10],[0,\" (i.e. a percentage of the canvas dimensions).\"],[10],[10],[0,\"\\n\\n  \"],[7,\"li\"],[9],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"The training data set maps this range of mouse coordinates values as \"],[7,\"strong\"],[9],[0,\"inputs\"],[10],[0,\" to values of \"],[7,\"strong\"],[9],[0,\"XOR function\"],[10],[0,\" truth table as outputs! Pretty neat, huh!\"],[10],[10],[0,\"\\n\\n  \"],[7,\"li\"],[9],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"The same data set is training two different types! So now you can see the differences. The first one is a \"],[7,\"strong\"],[9],[0,\"classification\"],[10],[0,\" model and outputs discrete values (integers). The second model does \"],[7,\"strong\"],[9],[0,\"regression\"],[10],[0,\" and outputs \"],[7,\"strong\"],[9],[0,\"continuous\"],[10],[0,\" values (floating point).\"],[10],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"You may be wondering now how these simple objects and learning can build really interesting things!\"],[10],[0,\"\\n\\n\"],[7,\"h2\"],[9],[0,\"If you want MOAR...\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"If you'd like to have a deeper exploration of Machine Learning concepts, check out the ``Machine Learning for Musicians and Artists`` guide.\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"There you can get your hands on more examples of RapidLib that apply an Interactive Machine Learning workflow!\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/rapidlib-guide.hbs" } });
});
;define("ember-share-db/templates/components/recording-guide", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "MHKi4+/Q", "block": "{\"symbols\":[],\"statements\":[[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nYou are able to record and download audio directly from the MIMIC platform. We add in a Recording button at the top of your sketch, you click it to start, then get a file at the end when you stop.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[7,\"img\"],[11,\"style\",\"margin:auto;width:400px;display:block;\"],[12,\"src\",[29,\"concat\",[[25,[\"url\"]],\"/images/rec-button.png\"],null]],[9],[10],[0,\"\\n\"],[7,\"figcaption\"],[11,\"style\",\"margin:auto;width:400px;display:block;text-align:center\"],[11,\"src\",\"\"],[9],[0,\"ITS YOUR BUTTON\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nIn order to do this, use the Recording Options menu above the document. You simply have to tell us which Web Audio Node you want to record.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nWAIT….WHATS A NODE?\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[7,\"a\"],[11,\"href\",\"https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API\"],[9],[0,\"Web Audio\"],[10],[0,\", the technology that underpins most in browser music making, operates a graph structure. Here, various nodes are connected together, pushing audio signals from one to another. Eventually some are connected to an output and can be heard from speakers / headphones / boomboxes / phones placed upside-down in empty pint glasses.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nMost of your favourite audio libraries will have one main output node that you can tap into to record the output coming from MIMIC. Or if you’re doing native Web Audio, you may have a mixer node of some sort.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nWe scour your code to try and identify variables that may contain nodes that you wish to record, and we give them to you in a list. These include the main audio engines of \"],[7,\"a\"],[12,\"href\",[29,\"concat\",[[25,[\"url\"]],\"/guides/maximJS\"],null]],[9],[0,\"the maximilian.js\"],[10],[0,\" and \"],[7,\"a\"],[12,\"hhref\",[29,\"concat\",[[25,[\"url\"]],\"/guides/maxi-instrument\"],null]],[9],[0,\"MaxiInstruments\"],[10],[0,\" libraries, and any native Web Audio constructors.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[7,\"img\"],[11,\"style\",\"margin:auto;width:600px;display:block;\"],[12,\"src\",[29,\"concat\",[[25,[\"url\"]],\"/images/rec-dropdown.png\"],null]],[9],[10],[0,\"\\n\"],[7,\"figcaption\"],[11,\"style\",\"margin:auto;width:400px;display:block;text-align:center\"],[11,\"src\",\"\"],[9],[0,\"Options, Options\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nIf we’ve not found what you want, you can also provide the name of the variable manually. E.g. myMassiveDistortionNode3\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nHappy Recording!\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/recording-guide.hbs" } });
});
;define("ember-share-db/templates/components/recording-panel", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "ZTS3wJ9G", "block": "{\"symbols\":[\"node\",\"index\"],\"statements\":[[7,\"div\"],[11,\"class\",\"tooltip\"],[9],[0,\"\\n  \"],[7,\"label\"],[11,\"class\",\"rec-checkbox\"],[11,\"for\",\"recordingCheckBox\"],[9],[0,\"Include Recording Button In Sketch?\"],[10],[0,\"\\n  \"],[1,[29,\"input\",null,[[\"tabIndex\",\"type\",\"id\",\"checked\",\"click\"],[\"0\",\"checkbox\",\"recordingCheckBox\",[25,[\"isRecording\"]],[29,\"action\",[[24,0,[]],\"toggleRecording\"],null]]]],false],[0,\"\\n  \"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[0,\"Toggle Recording Button\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"isRecording\"]]],null,{\"statements\":[[7,\"div\"],[11,\"id\",\"possible-rec-node-list\"],[9],[0,\"\\n  \"],[7,\"select\"],[11,\"id\",\"rec-select\"],[12,\"onchange\",[29,\"action\",[[24,0,[]],\"onSelectNode\"],[[\"value\"],[\"target.value\"]]]],[9],[0,\"\\n    \"],[7,\"option\"],[11,\"disabled\",\"\"],[9],[0,\" -- Pick a Node to Record -- \"],[10],[0,\"\\n\"],[4,\"each\",[[25,[\"possibleNodes\"]]],null,{\"statements\":[[0,\"       \"],[7,\"option\"],[12,\"value\",[24,2,[]]],[9],[1,[24,1,[\"variable\"]],false],[10],[0,\"\\n\"]],\"parameters\":[1,2]},null],[0,\"    \"],[7,\"option\"],[11,\"value\",\"user\"],[9],[0,\"Provide My Own\"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"showUserInput\"]]],null,{\"statements\":[[0,\"  \"],[7,\"span\"],[9],[0,\"\\n  \"],[1,[29,\"input\",null,[[\"role\",\"value\",\"type\",\"id\",\"placeholder\",\"focusOut\"],[\"form\",[25,[\"userNode\"]],\"form-control\",\"user-rec-input\",\"Type name of variable here\",[29,\"action\",[[24,0,[]],\"endEdittingUserNode\"],null]]]],false],[0,\"\\n \"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"  \"],[7,\"a\"],[11,\"style\",\"color:black;\"],[12,\"href\",[29,\"concat\",[[25,[\"url\"]],\"/guides/recording\"],null]],[9],[0,\"Whats a node?\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"parameters\":[]},null]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/recording-panel.hbs" } });
});
;define("ember-share-db/templates/components/rhythm-remixer-guide", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "QO2Dwwp8", "block": "{\"symbols\":[],\"statements\":[[7,\"h1\"],[9],[0,\"Use Your Voice Record in Rhythms\"],[10],[0,\"\\n\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"width\",\"height\"],[\"c89860a4-824a-5dfc-ff90-412f58531f5a\",\"250px\",\"1200px\"]]],false],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/rhythm-remixer-guide.hbs" } });
});
;define("ember-share-db/templates/components/shape-cell", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "rHHNbQo5", "block": "{\"symbols\":[\"s\"],\"statements\":[[7,\"div\"],[11,\"class\",\"shape-cell\"],[9],[0,\"\\n  \"],[7,\"svg\"],[12,\"class\",[23,\"svgClass\"]],[11,\"viewBox\",\"0 0 100 50\"],[11,\"preserveAspectRatio\",\"none\"],[9],[0,\"\\n\"],[4,\"each\",[[25,[\"shapes\"]]],null,{\"statements\":[[4,\"if\",[[24,1,[\"isCircle\"]]],null,{\"statements\":[[0,\"      \"],[7,\"circle\"],[12,\"cx\",[24,1,[\"x\"]]],[12,\"cy\",[24,1,[\"y\"]]],[12,\"r\",[24,1,[\"r\"]]],[11,\"fill\",\"white\"],[11,\"opacity\",\"0.175\"],[9],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[24,1,[\"isRect\"]]],null,{\"statements\":[[0,\"      \"],[7,\"rect\"],[12,\"x\",[24,1,[\"x\"]]],[12,\"y\",[24,1,[\"y\"]]],[12,\"width\",[24,1,[\"r\"]]],[12,\"height\",[24,1,[\"r\"]]],[11,\"fill\",\"white\"],[11,\"opacity\",\"0.175\"],[9],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[7,\"polygon\"],[12,\"points\",[29,\"concat\",[[24,1,[\"x\"]],\",\",[24,1,[\"y\"]],\" \",[24,1,[\"xr\"]],\",\",[24,1,[\"y\"]],\" \",[24,1,[\"x2r\"]],\",\",[24,1,[\"yr\"]]],null]],[11,\"fill\",\"white\"],[11,\"opacity\",\"0.3\"],[9],[10],[0,\"\\n      \"]],\"parameters\":[]}]],\"parameters\":[]}]],\"parameters\":[1]},null],[0,\"  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/shape-cell.hbs" } });
});
;define("ember-share-db/templates/components/share-modal", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "nHVGS+SR", "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"id\",\"share-modal\"],[9],[0,\"\\n\"],[7,\"label\"],[11,\"for\",\"edit-link\"],[9],[0,\"Editable Link\"],[10],[0,\"\\n\"],[1,[29,\"input\",null,[[\"class\",\"value\",\"type\",\"id\",\"name\"],[\"link-input\",[25,[\"options\",\"editLink\"]],\"form-control\",\"edit-link\",\"edit-link\"]]],false],[0,\"\\n\"],[7,\"label\"],[11,\"for\",\"display-link\"],[9],[0,\"Just Display Link\"],[10],[0,\"\\n\"],[1,[29,\"input\",null,[[\"class\",\"value\",\"type\",\"id\",\"name\"],[\"link-input\",[25,[\"options\",\"displayLink\"]],\"form-control\",\"display-link\",\"display-link\"]]],false],[0,\"\\n\"],[7,\"label\"],[11,\"for\",\"embed-link\"],[9],[0,\"Embed Link\"],[10],[0,\"\\n\"],[1,[29,\"input\",null,[[\"class\",\"value\",\"type\",\"id\",\"name\"],[\"link-input\",[25,[\"options\",\"embedLink\"]],\"form-control\",\"embed-link\",\"embed-link\"]]],false],[0,\"\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/share-modal.hbs" } });
});
;define("ember-share-db/templates/components/space-drum", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "x0XeuJgc", "block": "{\"symbols\":[],\"statements\":[[7,\"h1\"],[9],[0,\"A Spacebar is All You Need for a Drum Machine\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nRhythm is complex, you may have such an impression when looking at a sophisticated drum machine. All those knobs and buttons are supposed to work together to compose a drum pattern. You need to think about, in every detail, what to sound, when to sound, and how to sound, and input them all into the machine. But oftentimes, rhythm comes to your mind as a flowing groove with sounding details yet to be specified. You may, like me, tap on the table trying to capture the beating energy. So, what if the drum machine can understand your tapping and make up all the details for you?\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nMagenta’s GrooVAE can generate drum patterns based on a single sequence of time points. So, this programme takes your groove tapped onthe spacebar as input to the GrooVAE model, which then return you a completed pattern! Simple taps in, complex beats out!\\n\"],[10],[0,\"\\n\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"width\",\"height\"],[\"fd439a02-9ca3-b9db-9054-40aa3aa5cbb5\",\"250px\",\"850px\"]]],false],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nYou can replace the drum sounds with some from your favourite collections. Here’s how to do it:\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[7,\"ol\"],[9],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"Click the Setting icon in the menu bar, then Fork this project making it editable\"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"Click the File icon in the menu bar, then you can upload your own samples.\"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"Now you need to change the code. Make the code panel visible and select “sampler.js”. Inside the code you can find “const sampleMap”, which is the variable that defines the sample mapping.\"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"Observe what is defined in “const sampleMap”, you see there are 16 sample files being mapped to 16 MIDI notes. Don’t change the MIDI notes, but replace the names of the files with the ones you have uploaded.\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nOr, If you also want to twist the model a bit, telling it to be more, or less improvising, then:\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[7,\"ol\"],[9],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"Select “groove.js”, find “const temperature” in the code. This is the variable specifying the stochasticity level of the pattern generation.\"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"Try different values, pay attention to the subtle difference in the outcome around the sweet spot between order and chaos!\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nWe also have the 2-bar version SpaceDrum II that you might want to check out too. Have fun!\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/space-drum.hbs" } });
});
;define("ember-share-db/templates/components/spec-guide", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "wvcHDmhJ", "block": "{\"symbols\":[],\"statements\":[[7,\"h1\"],[9],[0,\"Delay Different Parts of the Spectrum \"],[10],[0,\"\\n\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"width\",\"height\"],[\"e8524aa9-d6a6-0809-83ef-e7b0891802bc\",\"350px\",\"1100px\"]]],false],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/spec-guide.hbs" } });
});
;define("ember-share-db/templates/components/sun-on-your-skin-guide", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "lqk6q/ST", "block": "{\"symbols\":[],\"statements\":[[7,\"h1\"],[9],[0,\" Body Tracker Regression Example \"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThis exercise has an initial step where you build your own controller using machine learning! There are also some suggestions for further remixing the patch with your own musical ideas which you can work on if you're into coding. You can still do loads of fun stuff without coding if you want, or if you want to get into the code, you can do that also!\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nIf you want to learn abit more about the basics of \"],[7,\"strong\"],[9],[0,\"supervised learning\"],[10],[0,\", you can check out this \"],[7,\"a\"],[12,\"href\",[29,\"concat\",[[25,[\"guideUrl\"]],\"supervised-ml\"],null]],[9],[0,\"guide.\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nWe’re going to try using a regression model to map several parameters of several synths to a skeleton tracker. Using the project below, we'll make a continuous mapping between your body and the parameters of this soundscape.\\n\"],[10],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"height\",\"manualLoad\"],[\"2fdd8ba2-3cb8-1838-49a5-fe9cfe6650ed\",\"500px\",false]]],false],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"h1\"],[9],[0,\"\\n    Building Your Own Regression Mapping\\n  \"],[10],[0,\"\\n  \"],[7,\"ol\"],[9],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"\\n      \"],[7,\"strong\"],[9],[0,\"Find a sound you like: \"],[10],[0,\"We have set up Learner.js and MaxiInstruments.js to map several parameters of each synth, including the filters, reverb and pitch.\\n      \"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n      When you press the “Randomise All” button, all of the mapped parameters will get new random values. You will see the sliders on the synth interfaces adjust as well.\\n      \"],[10],[0,\"\\n        \"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n       Our plan is to associate different positions and movements of your body to different sets of parameters.\\n       \"],[10],[0,\"\\n       We can provide a few examples and then when we train the model, the regression will provide a continuous mapping and we can use the body as an expressive controller.\\n  \"],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"\\n    \"],[7,\"strong\"],[9],[0,\"Match poses to sounds: \"],[10],[0,\"When you have found a sound you like, stand in one static pose.\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n    Hit Record and record in some values for about 3-4 seconds. Now every time you get a new camera reading, it will be saved in the dataset, alongside each of the current values of the mapped parameters. You should see the numbers of examples going up on the Learner.js interface.\\n  \"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n    Repeat this process of finding a set of sounds you like using the random button (or manually adjusting), picking a body position and recording in a few more pose - sound combinations.\\n  \"],[10],[0,\"\\n  \"],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"\\n    \"],[7,\"strong\"],[9],[0,\"Play with your trained model: \"],[10],[0,\"Hit “Train”. When it's ready, it will automatically start running.\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n     When you are running, everytime you get a new set of skeleton points from the camera, it will be fed into the model and the model will predict some new values for the synth parameters.\\n\"],[10],[0,\"\\n     These will then be applied in realtime to the synths (via a smoothing filter).\\n  \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[7,\"h1\"],[9],[0,\"\\nEditting the Code\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nAs well as building your own interactions through building a dataset, you can also edit other parts of the project to make your own creative work. To edit the project, you must first Fork it (make your own copy) using the button at the top of the code window.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nYou can use the \"],[7,\"a\"],[12,\"href\",[29,\"concat\",[[25,[\"guideUrl\"]],\"maxi-instruments\"],null]],[9],[0,\"MaxiInstruments.js\"],[10],[0,\" Guide and MaxiInstruments.js Documentation to help you when trying to edit the code.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[7,\"ul\"],[9],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"\\n    Change the mapped parameters\\n    \"],[7,\"ul\"],[9],[0,\"\\n      \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"\\n        You can change the parameters that are controlled by the regression model by changing names in the “mapped” array for each synth (around line 69). If you change the parameters that are mapped, you will have to delete your dataset and start again.\\n      \"],[10],[0,\"\\n      \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"\\n        You can update the parameters of the synthesisers that are not mapped (e.g. not controlled by the regression model) using the sliders in the interface. You can then press the “Print” button and the code for setting all these parameters will be posted to the console. You can then copy this into your project and the preset will be loaded whenever you run the patch.\\n      \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\" Change the sequences\\n    \"],[7,\"ul\"],[9],[0,\"\\n      \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"\\n      Each synth has a short single sequence, you can add in different patterns for each\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"\\n    Currently each synth has a slightly different length loop creating a phasing pattern, you can change this or just set one loop for all (line 122).\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n  \"],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\" Change the sample\\n    \"],[7,\"ul\"],[9],[0,\"\\n      \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"\\n      Currently the start point of the sample is being shortened every loop. You can find this in the setOnTick callback (line 138). This function is called on every tick and returns the value of each instrument's playhead and is useful for sequencing longer term structures.\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"\\n    Again, you can upload a new sample(s)  and load them in a sequence.\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/sun-on-your-skin-guide.hbs" } });
});
;define("ember-share-db/templates/components/supervised-ml-guide", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "IoVVFDVp", "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"class\",\"limited-width-container\"],[9],[0,\"\\n\"],[7,\"h1\"],[9],[0,\"Inputs and Outputs\"],[10],[0,\"\\n\"],[7,\"img\"],[12,\"src\",[29,\"concat\",[[25,[\"url\"]],\"mapping.png\"],null]],[11,\"style\",\"display: block;width:200px;margin:auto;padding:20px;\"],[9],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  We can think of most Digital Musical Instruments as taking some input from the real world (usually a performer(s) via some sensors), going through a mapping or analysis before creating a sonic output.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n   Whilst this can be hand coded….\\n\"],[10],[0,\"\\n\"],[7,\"h1\"],[9],[0,\"Supervised Learning\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nSupervised learning can be used to build models that predict new values, based on previous examples of input - output pairs.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThis allows us to build complex systems that can make predictions about unseen data. And the best part is, we don’t have to program them ourselves. We could spend time handcrafting computer programs ourselves and coming up with rules to decide if a certain percentage red pixels on a car dash cam means there’s a stop light, or if a triangle shaped thing coming out of a circle shaped thing is definitely a unicorn, or if a certain sequence of frequencies means a saxophone solo has begun.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThese tasks are hard or even impossible to program by hand, but are actually well within reach using machine learning. All we have to do is provide labelled examples.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nWith supervised machine learning, labels are the supreme ruler. After seeing a set of pictures labelled cat, and a set of pictures labelled dog, a model will hopefully be able to learn the difference. But it needs to see these original labelled ground truths first.\\n\"],[10],[0,\"\\n\"],[7,\"img\"],[12,\"src\",[29,\"concat\",[[25,[\"url\"]],\"supervised-ml.png\"],null]],[11,\"style\",\"display: block;width:700px;margin:auto;padding:20px;\"],[9],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nWe can then use these trained models in real time projects for musical instruments, installations and games combining cameras, sensors, sounds and more.\\n\"],[10],[0,\"\\n\"],[7,\"h1\"],[9],[0,\"Two types of models \"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThe first distinction we’ll make in models is between classification and regression, and the key difference here is in how each example is labelled.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[7,\"h3\"],[9],[0,\"Classification\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nIn classification tasks, the label applied to each new example is a discrete one. For example, that picture is a cat, that sound is a french horn. For building musical instruments, we are able to trigger events, change presets or patterns depending on which state the model predicts we are in.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[7,\"h3\"],[9],[0,\"Regression\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nIn regression tasks, the label is a continuous number. For example, this sound is 85% acoustic or this picture of a cat is 0.6 grumpy. For building musical instruments, we can use this to create continuous mappings between input signals and parameters of synthesisers or generative systems.\\n\"],[10],[0,\"\\n\"],[7,\"h1\"],[9],[0,\"The MIMIC Platform\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nThis is what this process looks like on the MIMIC Platform, using our clear examples, the \"],[7,\"a\"],[12,\"href\",[29,\"concat\",[[25,[\"guideUrl\"]],\"learner\"],null]],[9],[0,\" Learner.js\"],[10],[0,\" library and the the \"],[7,\"a\"],[12,\"href\",[29,\"concat\",[[25,[\"guideUrl\"]],\"maxi-instrument\"],null]],[9],[0,\" MaxiInstruments.js\"],[10],[0,\" library.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nNow you're in the know, you can either further investigate the libraries using their guides, or try a musical classification or regression example.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"ul\"],[9],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      Control this audio track with objects\"],[7,\"a\"],[12,\"href\",[29,\"concat\",[[25,[\"exampleUrl\"]],\"kick-classifier\"],null]],[9],[0,\" and your webcam\"],[10],[0,\"\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      Map the movements of your body to\"],[7,\"a\"],[12,\"href\",[29,\"concat\",[[25,[\"exampleUrl\"]],\"sun-on-your-skin\"],null]],[9],[0,\" a synth soundscape\"],[10],[0,\"\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      Learn more about the\"],[7,\"a\"],[12,\"href\",[29,\"concat\",[[25,[\"guideUrl\"]],\"learner\"],null]],[9],[0,\" Learner.js library\"],[10],[0,\"\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      Learn more about the\"],[7,\"a\"],[12,\"href\",[29,\"concat\",[[25,[\"guideUrl\"]],\"maxi-instruments\"],null]],[9],[0,\" MaxiInstruments.js library\"],[10],[0,\"\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"img\"],[12,\"src\",[29,\"concat\",[[25,[\"url\"]],\"supervisedlearninglearnermimic.png\"],null]],[11,\"style\",\"display: block;width:700px;margin:auto;padding:20px;\"],[9],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/supervised-ml-guide.hbs" } });
});
;define("ember-share-db/templates/components/tab-item", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "m0IDjki/", "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"class\",\"tab-item\"],[12,\"id\",[23,\"tabID\"]],[9],[0,\"\\n\"],[4,\"if\",[[25,[\"isSelected\"]]],null,{\"statements\":[[4,\"bs-button\",null,[[\"role\",\"tabIndex\",\"class\",\"onClick\"],[\"button\",\"0\",\"tab-btn selected-tab\",[29,\"action\",[[24,0,[]],\"onSelect\"],null]]],{\"statements\":[[0,\"  \"],[1,[23,\"name\"],false],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[]},{\"statements\":[[4,\"bs-button\",null,[[\"class\",\"role\",\"tabIndex\",\"onClick\"],[\"tab-btn\",\"button\",\"0\",[29,\"action\",[[24,0,[]],\"onSelect\"],null]]],{\"statements\":[[0,\"  \"],[1,[23,\"name\"],false],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[]}],[4,\"if\",[[25,[\"canDelete\"]]],null,{\"statements\":[[4,\"bs-button\",null,[[\"class\",\"role\",\"tabIndex\",\"onClick\",\"icon\"],[\"tab-delete-btn\",\"button\",\"0\",[29,\"action\",[[24,0,[]],\"onDelete\"],null],\"glyphicon glyphicon-remove\"]],{\"statements\":[],\"parameters\":[]},null]],\"parameters\":[]},null],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/tab-item.hbs" } });
});
;define("ember-share-db/templates/components/tokenfield-input", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "My2/72n5", "block": "{\"symbols\":[\"token\",\"index\"],\"statements\":[[7,\"div\"],[11,\"class\",\"uncharted-form-control\"],[9],[0,\"\\n    \"],[7,\"div\"],[11,\"class\",\"uncharted-token-main-container\"],[9],[0,\"\\n      \"],[7,\"div\"],[11,\"class\",\"uncharted-token-container\"],[9],[0,\"\\n\"],[4,\"if\",[[25,[\"hasTokens\"]]],null,{\"statements\":[[0,\"          \"],[7,\"div\"],[9],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"          \"],[7,\"p\"],[12,\"id\",[23,\"labelId\"]],[11,\"class\",\"tokenfield-label\"],[9],[0,\"<—\"],[1,[23,\"placeholder\"],false],[10],[0,\"\\n\"]],\"parameters\":[]}],[4,\"each\",[[25,[\"tokens\"]]],null,{\"statements\":[[0,\"            \"],[1,[29,\"component\",[[25,[\"tokenComponent\"]]],[[\"token\",\"index\",\"canDelete\",\"existingTokens\",\"allowDuplicates\",\"selectedTokenIndex\",\"createToken\",\"removeToken\",\"mouseDown\",\"doubleClick\"],[[24,1,[]],[24,2,[]],[25,[\"editable\"]],[25,[\"tokens\"]],[25,[\"allowDuplicates\"]],[25,[\"selectedTokenIndex\"]],[29,\"action\",[[24,0,[]],\"createToken\"],null],[29,\"action\",[[24,0,[]],\"removeToken\",[24,1,[]]],null],[29,\"action\",[[24,0,[]],\"selectToken\",[24,1,[]],[24,2,[]]],null],[29,\"action\",[[24,0,[]],\"editToken\",[24,1,[]]],null]]]],false],[0,\"\\n\"]],\"parameters\":[1,2]},null],[0,\"        \"],[7,\"div\"],[11,\"class\",\"tooltip\"],[9],[0,\"\\n          \"],[7,\"span\"],[11,\"class\",\"tooltiptext\"],[9],[1,[23,\"placeholder\"],false],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"editable\"]]],null,{\"statements\":[[4,\"if\",[[25,[\"showInput\"]]],null,{\"statements\":[[4,\"bs-button\",null,[[\"tabIndex\",\"class\",\"id\",\"icon\",\"onClick\"],[\"0\",\"add-file-button\",[25,[\"addButtonId\"]],\"glyphicon glyphicon-chevron-up\",[29,\"action\",[[24,0,[]],\"addPressed\"],null]]],{\"statements\":[],\"parameters\":[]},null]],\"parameters\":[]},{\"statements\":[[4,\"bs-button\",null,[[\"tabIndex\",\"class\",\"id\",\"icon\",\"onClick\"],[\"0\",\"add-file-button\",[25,[\"addButtonId\"]],\"glyphicon glyphicon-plus\",[29,\"action\",[[24,0,[]],\"addPressed\"],null]]],{\"statements\":[],\"parameters\":[]},null]],\"parameters\":[]}]],\"parameters\":[]},null],[0,\"          \"],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"showInput\"]]],null,{\"statements\":[[0,\"          \"],[1,[29,\"input\",null,[[\"type\",\"tabIndex\",\"class\",\"id\",\"placeholder\",\"value\"],[\"text\",\"0\",\"uncharted-token-input\",[25,[\"tokenfieldId\"]],[25,[\"placeholder\"]],[25,[\"inputValue\"]]]]],false],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"        \"],[10],[0,\"\\n\\n    \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"showDuplicateMessage\"]]],null,{\"statements\":[[0,\"    \"],[7,\"p\"],[11,\"class\",\"uncharted-duplicate-message\"],[9],[0,\"\\n        \"],[7,\"span\"],[11,\"class\",\"fa fa-exclamation-circle\"],[9],[10],[0,\"\\n        Duplicate values are not allowed\\n    \"],[10],[0,\"\\n\"]],\"parameters\":[]},null]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/components/tokenfield-input.hbs" } });
});
;define("ember-share-db/templates/crash-course", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "0gOdjZ6D", "block": "{\"symbols\":[],\"statements\":[[1,[23,\"outlet\"],false]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/crash-course.hbs" } });
});
;define("ember-share-db/templates/documents", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "dEyW+6L2", "block": "{\"symbols\":[\"document\",\"index\",\"filter\",\"index\",\"filter\",\"index\",\"filter\",\"index\",\"filter\",\"index\"],\"statements\":[[7,\"div\"],[11,\"id\",\"main-document-container\"],[11,\"class\",\"limited-width-container\"],[9],[0,\"\\n\"],[7,\"form\"],[9],[0,\"\\n  \"],[1,[29,\"input\",null,[[\"role\",\"id\",\"class\",\"placeholder\",\"value\",\"key-down\"],[\"form\",\"searchTerm\",\"limited-width-container\",\"search\",[25,[\"initialSearchValue\"]],[29,\"action\",[[24,0,[]],\"search\"],null]]]],false],[0,\"\\n  \"],[7,\"label\"],[11,\"for\",\"searchTerm\"],[11,\"style\",\"color:transparent;\"],[9],[0,\"search bar\"],[10],[0,\"\\n\"],[3,\"action\",[[24,0,[]],\"search\"],[[\"on\"],[\"submit\"]]],[10],[0,\"\\n\"],[7,\"div\"],[11,\"class\",\"row\"],[11,\"id\",\"doc-create-container\"],[9],[0,\"\\n\"],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"feedbackMessage\"]]],null,{\"statements\":[[0,\"  \"],[7,\"label\"],[9],[1,[23,\"feedbackMessage\"],false],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"hasNoDocuments\"]]],null,{\"statements\":[[0,\"  \"],[7,\"h2\"],[11,\"style\",\"text-align:center;\"],[9],[0,\"No Results\"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[7,\"div\"],[11,\"id\",\"filter-container\"],[9],[0,\"\\n\"],[4,\"if\",[[25,[\"mediaQueries\",\"isXs\"]]],null,{\"statements\":[[7,\"div\"],[11,\"class\",\"row\"],[9],[0,\"\\n\"],[4,\"each\",[[25,[\"showingFilters\"]]],null,{\"statements\":[[0,\"  \"],[7,\"div\"],[11,\"class\",\"col-xs-6 filter-col filter-col-xs\"],[9],[0,\"\\n    \"],[1,[29,\"filter-item\",null,[[\"role\",\"tabIndex\",\"filter\",\"onFilter\",\"isSelected\"],[\"button\",\"0\",[24,9,[]],[29,\"action\",[[24,0,[]],\"filter\",[24,9,[]]],null],[24,9,[\"isSelected\"]]]]],false],[0,\"\\n  \"],[10],[0,\"\\n\"]],\"parameters\":[9,10]},null],[4,\"if\",[[25,[\"isMore\"]]],null,{\"statements\":[[0,\"  \"],[7,\"div\"],[11,\"class\",\"col-xs-6 filter-col filter-col-xs\"],[9],[0,\"\\n    \"],[7,\"div\"],[11,\"role\",\"button\"],[11,\"tabIndex\",\"0\"],[11,\"class\",\"filter-item load-more-item\"],[12,\"onkeypress\",[29,\"action\",[[24,0,[]],\"loadMore\",2],null]],[12,\"onclick\",[29,\"action\",[[24,0,[]],\"loadMore\",2],null]],[9],[0,\"\\n      \"],[7,\"p\"],[11,\"class\",\"filter-text\"],[9],[0,\"More...\"],[10],[0,\"\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"  \"],[7,\"div\"],[11,\"class\",\"col-xs-2 filter-col filter-col-lg\"],[9],[0,\"\\n    \"],[7,\"div\"],[11,\"role\",\"button\"],[11,\"tabIndex\",\"0\"],[11,\"class\",\"filter-item load-more-item\"],[12,\"onkeypress\",[29,\"action\",[[24,0,[]],\"loadLess\"],null]],[12,\"onclick\",[29,\"action\",[[24,0,[]],\"loadLess\"],null]],[9],[0,\"\\n      \"],[7,\"p\"],[11,\"class\",\"filter-text\"],[9],[0,\"Less...\"],[10],[0,\"\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"]],\"parameters\":[]}],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[25,[\"mediaQueries\",\"isSm\"]]],null,{\"statements\":[[7,\"div\"],[11,\"class\",\"row\"],[11,\"id\",\"filter-row\"],[9],[0,\"\\n\"],[4,\"each\",[[25,[\"showingFilters\"]]],null,{\"statements\":[[0,\"  \"],[7,\"div\"],[11,\"class\",\"col-xs-4 filter-col filter-col-sm\"],[9],[0,\"\\n    \"],[1,[29,\"filter-item\",null,[[\"filter\",\"onFilter\",\"isSelected\"],[[24,7,[]],[29,\"action\",[[24,0,[]],\"filter\",[24,7,[]]],null],[24,7,[\"isSelected\"]]]]],false],[0,\"\\n  \"],[10],[0,\"\\n\"]],\"parameters\":[7,8]},null],[4,\"if\",[[25,[\"isMore\"]]],null,{\"statements\":[[0,\"  \"],[7,\"div\"],[11,\"class\",\"col-xs-4 filter-col filter-col-sm\"],[9],[0,\"\\n    \"],[7,\"div\"],[11,\"role\",\"button\"],[11,\"tabIndex\",\"0\"],[11,\"class\",\"filter-item load-more-item\"],[12,\"onkeypress\",[29,\"action\",[[24,0,[]],\"loadMore\",3],null]],[12,\"onclick\",[29,\"action\",[[24,0,[]],\"loadMore\",3],null]],[9],[0,\"\\n      \"],[7,\"p\"],[11,\"class\",\"filter-text\"],[9],[0,\"More...\"],[10],[0,\"\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"  \"],[7,\"div\"],[11,\"class\",\"col-xs-2 filter-col filter-col-lg\"],[9],[0,\"\\n    \"],[7,\"div\"],[11,\"role\",\"button\"],[11,\"tabIndex\",\"0\"],[11,\"class\",\"filter-item load-more-item\"],[12,\"onkeypress\",[29,\"action\",[[24,0,[]],\"loadLess\"],null]],[12,\"onclick\",[29,\"action\",[[24,0,[]],\"loadLess\"],null]],[9],[0,\"\\n      \"],[7,\"p\"],[11,\"class\",\"filter-text\"],[9],[0,\"Less...\"],[10],[0,\"\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"]],\"parameters\":[]}],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[25,[\"mediaQueries\",\"isMd\"]]],null,{\"statements\":[[7,\"div\"],[11,\"class\",\"row\"],[11,\"id\",\"filter-row\"],[9],[0,\"\\n\"],[4,\"each\",[[25,[\"showingFilters\"]]],null,{\"statements\":[[0,\"  \"],[7,\"div\"],[11,\"class\",\"col-xs-3 filter-col filter-col-md\"],[9],[0,\"\\n    \"],[1,[29,\"filter-item\",null,[[\"role\",\"tabIndex\",\"filter\",\"onFilter\",\"isSelected\"],[\"button\",\"0\",[24,5,[]],[29,\"action\",[[24,0,[]],\"filter\",[24,5,[]]],null],[24,5,[\"isSelected\"]]]]],false],[0,\"\\n  \"],[10],[0,\"\\n\"]],\"parameters\":[5,6]},null],[4,\"if\",[[25,[\"isMore\"]]],null,{\"statements\":[[0,\"  \"],[7,\"div\"],[11,\"class\",\"col-xs-3 filter-col filter-col-md\"],[9],[0,\"\\n    \"],[7,\"div\"],[11,\"role\",\"button\"],[11,\"tabIndex\",\"0\"],[11,\"class\",\"filter-item load-more-item\"],[12,\"onkeypress\",[29,\"action\",[[24,0,[]],\"loadMore\",4],null]],[12,\"onclick\",[29,\"action\",[[24,0,[]],\"loadMore\",4],null]],[9],[0,\"\\n      \"],[7,\"p\"],[11,\"class\",\"filter-text\"],[9],[0,\"More...\"],[10],[0,\"\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"  \"],[7,\"div\"],[11,\"class\",\"col-xs-2 filter-col filter-col-lg\"],[9],[0,\"\\n    \"],[7,\"div\"],[11,\"role\",\"button\"],[11,\"tabIndex\",\"0\"],[11,\"class\",\"filter-item load-more-item\"],[12,\"onkeypress\",[29,\"action\",[[24,0,[]],\"loadLess\"],null]],[12,\"onclick\",[29,\"action\",[[24,0,[]],\"loadLess\"],null]],[9],[0,\"\\n      \"],[7,\"p\"],[11,\"class\",\"filter-text\"],[9],[0,\"Less...\"],[10],[0,\"\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"]],\"parameters\":[]}],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[7,\"div\"],[11,\"class\",\"row\"],[11,\"id\",\"filter-row\"],[9],[0,\"\\n\"],[4,\"each\",[[25,[\"showingFilters\"]]],null,{\"statements\":[[0,\"  \"],[7,\"div\"],[11,\"class\",\"col-xs-2 filter-col filter-col-lg\"],[9],[0,\"\\n    \"],[1,[29,\"filter-item\",null,[[\"role\",\"tabIndex\",\"filter\",\"onFilter\",\"isSelected\"],[\"button\",\"0\",[24,3,[]],[29,\"action\",[[24,0,[]],\"filter\",[24,3,[]]],null],[24,3,[\"isSelected\"]]]]],false],[0,\"\\n  \"],[10],[0,\"\\n\"]],\"parameters\":[3,4]},null],[4,\"if\",[[25,[\"isMore\"]]],null,{\"statements\":[[0,\"  \"],[7,\"div\"],[11,\"class\",\"col-xs-2 filter-col filter-col-lg\"],[9],[0,\"\\n    \"],[7,\"div\"],[11,\"role\",\"button\"],[11,\"tabIndex\",\"0\"],[11,\"class\",\"filter-item load-more-item\"],[12,\"onclick\",[29,\"action\",[[24,0,[]],\"loadMore\",5],null]],[12,\"onkeypress\",[29,\"action\",[[24,0,[]],\"loadMore\",5],null]],[9],[0,\"\\n      \"],[7,\"p\"],[11,\"class\",\"filter-text\"],[9],[0,\"More...\"],[10],[0,\"\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"  \"],[7,\"div\"],[11,\"class\",\"col-xs-2 filter-col filter-col-lg\"],[9],[0,\"\\n    \"],[7,\"div\"],[11,\"role\",\"button\"],[11,\"tabIndex\",\"0\"],[11,\"class\",\"filter-item load-more-item\"],[12,\"onclick\",[29,\"action\",[[24,0,[]],\"loadLess\"],null]],[12,\"onclick\",[29,\"action\",[[24,0,[]],\"loadLess\"],null]],[9],[0,\"\\n      \"],[7,\"p\"],[11,\"class\",\"filter-text\"],[9],[0,\"Less...\"],[10],[0,\"\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"]],\"parameters\":[]}],[10],[0,\"\\n\"]],\"parameters\":[]}]],\"parameters\":[]}]],\"parameters\":[]}],[10],[0,\"\\n\"],[7,\"div\"],[11,\"class\",\"container-fluid\"],[11,\"id\",\"document-container\"],[9],[0,\"\\n  \"],[7,\"div\"],[11,\"class\",\"row\"],[9],[0,\"\\n\"],[4,\"each\",[[25,[\"model\",\"docs\"]]],null,{\"statements\":[[0,\"        \"],[1,[29,\"document-list-item\",null,[[\"document\",\"index\",\"onOpen\",\"onDelete\"],[[24,1,[]],[24,2,[]],[29,\"action\",[[24,0,[]],\"openDocument\",[24,1,[\"documentId\"]]],null],[29,\"action\",[[24,0,[]],\"deleteDocument\",[24,1,[\"documentId\"]]],null]]]],false],[0,\"\\n\"]],\"parameters\":[1,2]},null],[0,\"  \"],[10],[0,\"\\n  \"],[7,\"div\"],[11,\"id\",\"page-nav-container\"],[9],[0,\"\\n\"],[4,\"if\",[[25,[\"canGoBack\"]]],null,{\"statements\":[[0,\"    \"],[7,\"button\"],[11,\"role\",\"button\"],[11,\"tabIndex\",\"0\"],[11,\"class\",\"pagination-button\"],[11,\"id\",\"prev-page-btn\"],[9],[0,\"Previous\"],[3,\"action\",[[24,0,[]],\"prevPage\"]],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"canGoForwards\"]]],null,{\"statements\":[[0,\"    \"],[7,\"button\"],[11,\"role\",\"button\"],[11,\"tabIndex\",\"0\"],[11,\"class\",\"pagination-button\"],[11,\"id\",\"next-page-btn\"],[9],[0,\"Next\"],[3,\"action\",[[24,0,[]],\"nextPage\"]],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/documents.hbs" } });
});
;define("ember-share-db/templates/examples", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "T+yZR3Pg", "block": "{\"symbols\":[\"group\",\"index\",\"example\"],\"statements\":[[4,\"if\",[[25,[\"isExample\"]]],null,{\"statements\":[[0,\"  \"],[7,\"div\"],[11,\"id\",\"example-text-container\"],[9],[0,\"\\n\"],[4,\"if\",[[25,[\"isMagnet\"]]],null,{\"statements\":[[0,\"    \"],[1,[23,\"magnet-guide\"],false],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"isBBcut\"]]],null,{\"statements\":[[0,\"    \"],[1,[23,\"bbcut-guide\"],false],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"isEvolib\"]]],null,{\"statements\":[[0,\"    \"],[1,[23,\"evolib-example-guide\"],false],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"isMario\"]]],null,{\"statements\":[[0,\"    \"],[1,[23,\"mario-guide\"],false],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"isMerk\"]]],null,{\"statements\":[[0,\"    \"],[1,[23,\"merkgenta-guide\"],false],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"isMarkov\"]]],null,{\"statements\":[[0,\"    \"],[1,[23,\"markov-guide\"],false],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"isAudiotrig\"]]],null,{\"statements\":[[0,\"    \"],[1,[23,\"audio-classifier-guide\"],false],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"isFace\"]]],null,{\"statements\":[[0,\"    \"],[1,[23,\"face-synth-guide\"],false],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"isRhythm\"]]],null,{\"statements\":[[0,\"    \"],[1,[23,\"rhythm-remixer-guide\"],false],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"isConceptular\"]]],null,{\"statements\":[[0,\"    \"],[1,[23,\"conceptular-guide\"],false],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"isSpec\"]]],null,{\"statements\":[[0,\"    \"],[1,[23,\"spec-guide\"],false],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"isLyric\"]]],null,{\"statements\":[[0,\"    \"],[1,[23,\"lyric-guide\"],false],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"isSun\"]]],null,{\"statements\":[[0,\"    \"],[1,[23,\"sun-on-your-skin-guide\"],false],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"isKicks\"]]],null,{\"statements\":[[0,\"    \"],[1,[23,\"kick-classifier-guide\"],false],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"isSpaceDrum\"]]],null,{\"statements\":[[0,\"    \"],[1,[23,\"space-drum\"],false],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"isAutoPilot\"]]],null,{\"statements\":[[0,\"    \"],[1,[23,\"autopilot-guide\"],false],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"  \"],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"  \"],[7,\"div\"],[11,\"id\",\"tutorial-container\"],[9],[0,\"\\n  \"],[7,\"h2\"],[9],[0,\"Examples\"],[10],[0,\"\\n  \"],[7,\"h3\"],[9],[0,\"Example projects\"],[10],[0,\"\\n  \"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  These projects demonstrate how to use machine intelligence to make music in the browser\\n  \"],[10],[0,\"\\n  \"],[7,\"div\"],[11,\"id\",\"example-container\"],[11,\"class\",\"row\"],[9],[0,\"\\n\"],[4,\"each\",[[25,[\"model\"]]],null,{\"statements\":[[0,\"      \"],[7,\"h1\"],[9],[1,[24,1,[\"title\"]],false],[10],[0,\"\\n      \"],[7,\"div\"],[11,\"class\",\"row\"],[9],[0,\"\\n\"],[4,\"each\",[[24,1,[\"examples\"]]],null,{\"statements\":[[0,\"        \"],[1,[29,\"example-tile\",null,[[\"onClick\",\"example\",\"index\"],[[29,\"action\",[[24,0,[]],\"onClick\",[24,3,[]]],null],[24,3,[]],[24,2,[]]]]],false],[0,\"\\n\"]],\"parameters\":[3]},null],[0,\"      \"],[10],[0,\"\\n\"]],\"parameters\":[1,2]},null],[0,\"    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"]],\"parameters\":[]}]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/examples.hbs" } });
});
;define("ember-share-db/templates/futurelearn", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "0HpNFieA", "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"class\",\"limited-width-container\"],[11,\"style\",\"font-size:16px padding:2px;margin-top:2px;\"],[9],[0,\"\\n\"],[7,\"h2\"],[9],[7,\"strong\"],[9],[0,\"Participant Information Sheet for users of the MIMIC Platform\"],[10],[10],[0,\"\\n\\n\"],[7,\"h2\"],[9],[7,\"strong\"],[9],[0,\"Title of the research study: MIMIC Futurelearn Survey\"],[10],[10],[0,\"\\n\\n\"],[7,\"p\"],[9],[0,\"Dr Louis McCallum\"],[10],[0,\"\\n\"],[7,\"p\"],[9],[7,\"a\"],[11,\"href\",\"mailto:l.mccallum@gold.ac.uk\"],[9],[0,\"l.mccallum@gold.ac.uk\"],[10],[10],[0,\"\\n\\n\"],[7,\"p\"],[9],[0,\"Dr Rebecca Fiebrink\"],[10],[0,\"\\n\"],[7,\"p\"],[9],[7,\"a\"],[11,\"href\",\"mailto:r.feibrink@gold.ac.uk\"],[9],[0,\"r.feibrink@gold.ac.uk\"],[10],[10],[0,\"\\n\\n\"],[7,\"p\"],[9],[0,\"Dr Matthew Yee-King\"],[10],[0,\"\\n\"],[7,\"p\"],[9],[7,\"a\"],[11,\"href\",\"mailto:m.yeeking@gold.ac.uk\"],[9],[0,\"m.yeeking@gold.ac.uk\"],[10],[10],[0,\"\\n\\n\"],[7,\"p\"],[9],[7,\"strong\"],[9],[0,\"ALL:\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[9],[0,\"Goldsmiths, University of London\"],[7,\"br\"],[9],[10],[0,\" New Cross\"],[7,\"br\"],[9],[10],[0,\" London\"],[7,\"br\"],[9],[10],[0,\" SE14 6NW\"],[7,\"br\"],[9],[10],[0,\" UK\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[9],[7,\"em\"],[9],[0,\"You are being invited to take part in a research study. Before you decide whether or not to take part, it is important for you to understand why the research is being done and what it will involve. Please take time to read the following information carefully\"],[10],[10],[0,\"\\n\\n\"],[7,\"h3\"],[9],[7,\"strong\"],[9],[0,\"What is the purpose of the study?\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[9],[0,\"The MIMIC platform  provides web-based machine listening and machine learning tools. We are conducting surveys with potential or active users with regards to their experiences of the platform, and or using such techniques in their practise. This allows us to better understand how the tools can be developed and presented to musicians, educators and beyond.\"],[10],[0,\"\\n\\n\"],[7,\"h3\"],[9],[7,\"strong\"],[9],[0,\"Why have I been invited to participate?\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[9],[0,\"You have been invited to participate in this study as a learner on the UAL CCI Machine Learning FutureLearn course. You will complete this survey along with many other users.\"],[10],[0,\"\\n\\n\"],[7,\"h3\"],[9],[7,\"strong\"],[9],[0,\"Do I have to take part?  \"],[10],[10],[0,\"\\n\"],[7,\"p\"],[9],[7,\"em\"],[9],[0,\"It  is entirely up to you to decide whether or not to take part. If you decide to do so, and if you want to you can download this information sheet\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[9],[7,\"em\"],[9],[0,\" \"],[10],[10],[0,\"\\n\"],[7,\"p\"],[9],[7,\"strong\"],[9],[0,\"Can I withdraw from the study?\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[9],[7,\"em\"],[9],[0,\"You can withdraw from the study at any time without giving a reason. If you request, any data collected up to the point of withdrawal will be destroyed. \"],[10],[10],[0,\"\\n\\n\"],[7,\"h3\"],[9],[7,\"strong\"],[9],[0,\"What will happen if I take part?\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[9],[0,\"We will ask you a number of questions regarding your knowledge of and reasoning about machine learning. All will be scenarios you may have encountered in videos or written content up until this point.\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[9],[0,\"Questions will be filled out via a quiz on the FutureLearn site.\"],[10],[0,\"\\n\\n\"],[7,\"h3\"],[9],[7,\"strong\"],[9],[0,\"What are the possible disadvantages and risks of taking part? \"],[10],[10],[0,\"\\n\"],[7,\"p\"],[9],[0,\"We are committed to keeping your contributions anonymous, as such we have a clear and strong data policy which is listed below.\"],[10],[0,\"\\n\\n\"],[7,\"h3\"],[9],[7,\"strong\"],[9],[0,\"What are the possible benefits of taking part?\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[9],[0,\"As participants completing surveys or interviews are the target users of the platform itself, any feedback or evaluation will directly influence the development of the site and our understanding of how best to support their creative and learning needs.\"],[10],[0,\"\\n\\n\"],[7,\"h3\"],[9],[7,\"strong\"],[9],[0,\"Will what I say in this study be kept confidential?\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[9],[0,\"All the information that we collect about you during the course of the research will be kept strictly confidential. You will not be able to be identified in any ensuing reports or publications. \"],[10],[0,\"\\n\\n\"],[7,\"p\"],[9],[0,\"Any responses are anonymised and will be stored in secure Goldsmiths online area.\"],[10],[0,\"\\n\"],[7,\"p\"],[9],[0,\"Data will be kept unless you withdraw your consent, which you may do at any time, in which case it will be deleted.\"],[10],[0,\"\\n\"],[7,\"p\"],[9],[7,\"strong\"],[9],[0,\"Limits to confidentiality\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[9],[0,\"Confidentiality will be respected subject to legal constraints and professional guidelines.\"],[10],[0,\"\\n\"],[7,\"p\"],[9],[0,\"Please note that assurances on confidentiality will be strictly adhered to unless evidence of wrongdoing or potential harm is uncovered.  In such cases Goldsmiths may be obliged to contact relevant statutory bodies or agencies.\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[9],[7,\"strong\"],[9],[0,\"What will happen to the results of the research study?\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[9],[0,\"We will publish analysis of interview and survey data in leading conferences and journals in our field. We will not share the raw data.\"],[10],[0,\"\\n\\n\"],[7,\"h3\"],[9],[7,\"strong\"],[9],[0,\"Who is organising and funding the research?\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[9],[0,\"This project is funded by the AHRC and involves researchers from Goldsmiths College, Durham University and the University of Sussex.\"],[10],[0,\"\\n\\n\\n\"],[7,\"p\"],[9],[7,\"strong\"],[9],[0,\"What if something goes wrong?\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[9],[0,\"If you have any concerns about your participation or about the study in general, you should first contact any of the lead researchers (listed above).  If you feel your complaint has not been satisfactorily handled, you can contact the Chair of the Goldsmiths Research Ethics and Integrity Sub-Committee via Research Services (020 7919 7770, \"],[7,\"a\"],[11,\"href\",\"mailto:reisc@gold.ac.uk\"],[9],[0,\"reisc@gold.ac.uk\"],[10],[0,\")\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[9],[0,\" Thank you for reading this information sheet and for considering whether to take part in this research study.\"],[10],[0,\"\\n\"],[7,\"p\"],[9],[7,\"strong\"],[9],[0,\" \"],[10],[10],[0,\"\\n\"],[7,\"p\"],[9],[7,\"strong\"],[9],[0,\"Data Protection Privacy Notice\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[9],[7,\"strong\"],[9],[0,\" \"],[10],[10],[0,\"\\n\"],[7,\"p\"],[9],[7,\"strong\"],[9],[0,\"The General Data Protection Regulation [GDPR] and Goldsmiths Research: guidelines for participants\"],[10],[10],[0,\"\\n\\n\"],[7,\"p\"],[9],[0,\"Please note that this document does not constitute, and should not be construed as, legal advice.  These guidelines are designed to help participants understand their rights under GDPR which came into force on 25 May 2018.\"],[10],[0,\"\\n\\n\\n\"],[7,\"p\"],[9],[7,\"strong\"],[9],[0,\"Your rights as a participant (data subject) in this study\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[9],[0,\"The updated data protection regulation is a series of conditions designed to protect an individual's personal data.  Not all data collected for research is personal data. \"],[10],[0,\"\\n\\n\"],[7,\"p\"],[9],[0,\"Personal data is data such that a living individual can be identified; collection of personal data is sometimes essential in conducting research and GDPR sets out that data subjects should be treated in a lawful and fair manner and that information about the data processing should be explained clearly and transparently.  Some data we might ask to collect falls under the heading of \"],[7,\"strong\"],[9],[0,\"special categories data\"],[10],[0,\".  This type of  information includes data about an individual’s race; ethnic origin; politics; religion; trade union membership; genetics; biometrics (where used for ID purposes); health; sex life; or sexual orientation.   This data requires particular care.\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[9],[0,\"Under GDPR you have the following rights over your personal data\"],[7,\"a\"],[11,\"href\",\"#_ftn1\"],[11,\"name\",\"_ftnref1\"],[9],[0,\"[1]\"],[10],[0,\":\"],[7,\"br\"],[9],[10],[0,\" \"],[10],[0,\"\\n\"],[7,\"ul\"],[9],[0,\"\\n\"],[7,\"li\"],[9],[7,\"strong\"],[9],[7,\"em\"],[9],[0,\"The right to be informed\"],[10],[10],[0,\". You must be informed if your personal data is being used.\"],[10],[0,\"\\n\"],[7,\"li\"],[9],[7,\"strong\"],[9],[7,\"em\"],[9],[0,\"The right of access\"],[10],[10],[0,\". You can ask for a copy of your data by making a ‘subject access request’.\"],[10],[0,\"\\n\"],[7,\"li\"],[9],[7,\"strong\"],[9],[7,\"em\"],[9],[0,\"The right to rectification.\"],[10],[10],[0,\" You can ask for your data held to be corrected.\"],[10],[0,\"\\n\"],[7,\"li\"],[9],[7,\"strong\"],[9],[7,\"em\"],[9],[0,\"The right to erasure\"],[10],[10],[0,\". You can ask for your data to be deleted.\"],[10],[0,\"\\n\"],[7,\"li\"],[9],[7,\"strong\"],[9],[7,\"em\"],[9],[0,\"The right to restrict processing\"],[10],[10],[0,\". You can limit the way an organisation uses your personal data if you are concerned about the accuracy of the data or how it is being used.\"],[10],[0,\"\\n\"],[7,\"li\"],[9],[7,\"strong\"],[9],[7,\"em\"],[9],[0,\"The right to data portability\"],[10],[10],[0,\". You have the right to get your personal data from an organisation in a way that is accessible and machine-readable.  You also have the right to ask an organisation to transfer your data to another organisation.\"],[10],[0,\"\\n\"],[7,\"li\"],[9],[7,\"strong\"],[9],[7,\"em\"],[9],[0,\"The right to object\"],[10],[10],[0,\". You have the right to object to the use of your personal data in some circumstances. You have an absolute right to object to an organisation using your data for direct marketing.\"],[10],[0,\"\\n\"],[7,\"li\"],[9],[7,\"strong\"],[9],[7,\"em\"],[9],[0,\"How your data is processed using automated decision making and profiling\"],[10],[10],[0,\". You have the right not to be subject to a decision that is based solely on automated processing if the decision affects your legal rights or other equally important matters; to understand the reasons behind decisions made about you by automated processing and the possible consequences of the decisions, andto object to profiling in certain situations, including for direct marketing purposes.\"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[9],[0,\"Please note that these rights are not absolute and only apply in certain circumstances.  You should also be informed how long your data will be retained and who it might be shared with.\"],[10],[0,\"\\n\\n\\n\"],[7,\"p\"],[9],[7,\"strong\"],[9],[0,\"How does Goldsmiths treat my contribution to this study?\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[9],[0,\"Your participation in this research is very valuable and any personal data you provide will be treated in confidence using the best technical means available to us.  The university's legal basis for processing your data\"],[7,\"a\"],[11,\"href\",\"#_ftn2\"],[11,\"name\",\"_ftnref2\"],[9],[0,\"[2]\"],[10],[0,\" as part of our research findings is a \\\"task carried out in the public interest\\\".  This means that our research is designed to improve the health, happiness and well-being of society and to help us better understand the world we live in.  It is not going to be used for marketing or commercial purposes.\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[9],[0,\"In addition to our legal basis under Article 6 (as described above), for \"],[7,\"strong\"],[9],[0,\"special categories data\"],[10],[0,\" as defined under Article 9 of GDPR, our condition for processing is that it is “necessary for archiving purposes in the public interest, scientific or historical research purposes or statistical purposes”.\"],[7,\"a\"],[11,\"href\",\"#_ftn3\"],[11,\"name\",\"_ftnref3\"],[9],[0,\"[3]\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[9],[7,\"em\"],[9],[0,\" \"],[10],[10],[0,\"\\n\"],[7,\"p\"],[9],[0,\"If your data contributes to data from a group then your ability to remove data may be limited as the study progresses, when removal of your data may cause damage to the dataset.\"],[10],[0,\"\\n\\n\\n\\n\"],[7,\"p\"],[9],[7,\"strong\"],[9],[0,\"You should also know that you may contact any of the following people if you are unhappy about the way your data or your participation in this study are being treated:  \"],[10],[10],[0,\"\\n\"],[7,\"p\"],[9],[7,\"strong\"],[9],[0,\"       \"],[10],[10],[0,\"\\n\"],[7,\"ul\"],[9],[0,\"\\n\"],[7,\"li\"],[9],[0,\"Chair, Goldsmiths Research Ethics and Integrity Sub-Committee - via \"],[7,\"a\"],[11,\"href\",\"mailto:reisc@gold.ac.uk\"],[9],[0,\"reisc@gold.ac.uk\"],[10],[0,\", REISC Secretary (for any other element of the study).\"],[10],[0,\"\\n\"],[7,\"li\"],[9],[0,\"You also have the right to lodge a complaint with the Information Commissioner’s Office at \"],[7,\"a\"],[11,\"href\",\"https://ico.org.uk/make-a-complaint/\"],[9],[0,\"https://ico.org.uk/make-a-complaint/\"],[10],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\\n\\n\\n\"],[7,\"p\"],[9],[7,\"em\"],[9],[0,\"This information has been provided by the Research Ethics and Integrity Sub-Committee with advice from the Research Services and Governance and Legal Teams.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[9],[7,\"em\"],[9],[0,\"Version: 13 August 2018\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[9],[7,\"strong\"],[9],[7,\"br\"],[9],[10],[0,\" \"],[10],[10],[0,\"\\n\"],[7,\"p\"],[9],[7,\"strong\"],[9],[0,\" \"],[10],[10],[0,\"\\n\\n\\n\"],[7,\"p\"],[9],[7,\"a\"],[11,\"href\",\"#_ftnref1\"],[11,\"name\",\"_ftn1\"],[9],[0,\"[1]\"],[10],[0,\" https://ico.org.uk/your-data-matters/\"],[10],[0,\"\\n\"],[7,\"p\"],[9],[7,\"a\"],[11,\"href\",\"#_ftnref2\"],[11,\"name\",\"_ftn2\"],[9],[0,\"[2]\"],[10],[0,\" GDPR Article 6; the six lawful bases for processing data are explained here: https://ico.org.uk/for-organisations/guide-to-the-general-data-protection-regulation-gdpr/lawful-basis-for-processing/\"],[10],[0,\"\\n\"],[7,\"p\"],[9],[7,\"a\"],[11,\"href\",\"#_ftnref3\"],[11,\"name\",\"_ftn3\"],[9],[0,\"[3]\"],[10],[0,\" Article 9 of the GDPR requires this type of data to be treated with great care because of the more significant risks to a person’s fundamental rights and freedoms that mishandling might cause, eg, by putting them at risk of unlawful discrimination.\"],[10],[0,\"\\n\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/futurelearn.hbs" } });
});
;define("ember-share-db/templates/getting-started", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "yPhfEKwv", "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"id\",\"tutorial-container\"],[9],[0,\"\\n\\n\"],[4,\"if\",[[25,[\"isAdvanced\"]]],null,{\"statements\":[[7,\"h1\"],[9],[0,\"Getting Started - Advanced\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nIn this advanced example, we'll show you how to\\n\"],[10],[0,\"\\n\"],[7,\"ul\"],[9],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"Import and use the libraries we provide \"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"Upload and playback an audio clip \"],[10],[0,\"\\n  \"],[7,\"li\"],[9],[0,\"Interact with this process live \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nLets start by making a new document\\n\"],[10],[0,\"\\n\"],[7,\"h2\"],[9],[0,\"Part 1: Using MIMIC Libraries\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nNext select the briefcase icon in the control panel and select \"],[7,\"code\"],[9],[0,\"MaxiInstruments\"],[10],[0,\". This should insert a script tag in the <head> that will inlcude the \"],[7,\"code\"],[9],[0,\"MaxiInstruments.js\"],[10],[0,\" synthesiser library. MIMIC hosts several libraries that are either commonly used or developed specially for the site that are easily insertable this way.\\n\"],[10],[0,\"\\n\"],[7,\"h2\"],[9],[0,\"Part 2: Uploading Media\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nNext we are going to upload an audio sample (any .wav file). Find one on your computer, either a full track, or a short loop will work best. Select the file icon and find your file and upload. When finished, you will be able to use your track by simply referring to it its name in the code.\\n\"],[10],[0,\"\\n\"],[7,\"img\"],[11,\"class\",\"tutorial-img\"],[12,\"src\",[29,\"concat\",[[25,[\"url\"]],\"upload-file.gif\"],null]],[9],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nDrop in this javascript into the script tag, inserting the name of your file where we have put <YOUR FILENAME>.\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"  \"],[7,\"code\"],[9],[0,\"\\n    const instruments = new MaxiInstruments();\\n    instruments.guiElement = document.body;\\n    instruments.loadModules().then(()=> {\\n      sampler = instruments.addSampler();\\n      sampler.loadSample(<YOUR FILENAME>, 0);\\n      sampler.setParam(\\\"rate_0\\\",1)\\n      instruments.setTempo(120);\\n      sampler.setSequence([{s:0, p:0}]);\\n      sampler.setLoop(16,4);\\n    })\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nWhen you hit run, you will hear your sample being played. Currently this is looping one bar at 120 bpm, which may not be right for your audio!\\n\"],[10],[0,\"\\n\"],[7,\"h2\"],[9],[0,\"Part 3: Live Coding\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nIn a MIMIC project, you are able to reevaluate new code without rerunning the whole project. This means we can update, for example, the play back rate of the sampler on the fly. In our case, the following line is responsible for this.\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"  \"],[7,\"code\"],[9],[0,\"\\n      sampler.setParam(\\\"rate_0\\\",1)\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nChange the \"],[7,\"strong\"],[9],[0,\"second argument\"],[10],[0,\" to \"],[7,\"code\"],[9],[0,\"0.5\"],[10],[0,\".\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"  \"],[7,\"code\"],[9],[0,\"\\n      sampler.setParam(\\\"rate_0\\\",0.5)\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nMove your cursor to this line, then hit \"],[7,\"code\"],[9],[0,\"Cmd+Enter\"],[10],[0,\" (Mac) or \"],[7,\"code\"],[9],[0,\"Ctrl+Enter\"],[10],[0,\" (Windows/Mac/Linux). Your music should now start playing at half speed! You can now keep changing the value and rerunning that line in the same way without interuptting the sound.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nTry changing some of the other code (like \"],[7,\"code\"],[9],[0,\"instruments.setTempo(120)\"],[10],[0,\" or \"],[7,\"code\"],[9],[0,\"sampler.setLoop(16,4)\"],[10],[0,\") and re-executing with \"],[7,\"code\"],[9],[0,\"Cmd+Enter\"],[10],[0,\" (Mac) or \"],[7,\"code\"],[9],[0,\"Ctrl+Enter\"],[10],[0,\" (Windows/Mac/Linux).\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nCheck out our version of this project here. Select the \"],[7,\"code\"],[9],[0,\"Start Demo\"],[10],[0,\" button, then \"],[7,\"code\"],[9],[0,\"Show Code\"],[10],[0,\" in the button right.\\n\"],[10],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"height\",\"manualLoad\"],[\"86812ccc-ec72-9a0b-8e1c-3d2e4ccee186\",\"500px\",true]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"\\n\\n\"],[7,\"h1\"],[9],[0,\"Getting Started\"],[10],[0,\"\\n\"],[7,\"h2\"],[9],[0,\"So what is the MIMIC platform?\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  MIMIC is primarily a place to make and share creative javascript projects that use machine learning. We have a built in code editor, a tonne of learning resources, some libraries specifically to help you make great projects quickly. You can\\n  \"],[7,\"ul\"],[9],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      Follow this guide. This will help you get an acccount setup and understand the code/project editor.\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      Watch \"],[7,\"a\"],[11,\"href\",\"http://strangeloop.co.uk/js-videos/video3.html\"],[9],[0,\"a video\"],[10],[0,\" of Mick Grierson completing this guide. Then do the guide.\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      Check out \"],[7,\"a\"],[11,\"href\",\"https://mimicproject.com/guides/learner\"],[9],[0,\"how to use Learner.js\"],[10],[0,\", our library for making quick machine learning web apps.\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      Check out \"],[7,\"a\"],[11,\"href\",\"https://mimicproject.com/inputs\"],[9],[0,\"this collection of inputs and feature extractors\"],[10],[0,\" you can use to make machine learning project.\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      Check out \"],[7,\"a\"],[11,\"href\",\"https://mimicproject.com/guides/maxi-instrument\"],[9],[0,\"how to use MaxiInstrument.js\"],[10],[0,\", our library for making audio worklet instruments in the browser.\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      Check out \"],[7,\"a\"],[11,\"href\",\"https://mimicproject.com/guides/root\"],[9],[0,\"a bunch of other guides\"],[10],[0,\".\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      Check out \"],[7,\"a\"],[11,\"href\",\"https://mimicproject.com/examples/root\"],[9],[0,\"some more polished example projects\"],[10],[0,\".\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      Do the free \"],[7,\"a\"],[11,\"href\",\"https://www.futurelearn.com/courses/apply-creative-machine-learning\"],[9],[0,\"FutureLearn course:\"],[10],[0,\" Apply Creative Machine Learning. Its all about MIMIC.\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"This guide will walk you through setting up your first project on MIMIC. There is also an \"],[7,\"a\"],[12,\"href\",[23,\"advancedurl\"]],[9],[0,\" advanced walk through\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"br\"],[9],[10],[0,\"\\n\"],[7,\"h2\"],[9],[0,\"Part 1: Make an Account\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"You will need to make an account to create your own projects. Select \\\"login\\\" in the top right hand corner to do so.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"Once you have an account, make a new project selecting the \\\"my projects\\\" drop down and clicking on the plus sign. You can change the name of your document to whatever you like.\\n\"],[10],[0,\"\\n\"],[7,\"img\"],[11,\"class\",\"tutorial-img\"],[12,\"src\",[29,\"concat\",[[25,[\"url\"]],\"createdoc.gif\"],null]],[9],[10],[0,\"\\n\"],[7,\"h2\"],[9],[0,\"Part 2: Use Some HTML\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"Your projects consists of a code editor (right) and a display window (left).\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"The code editor shows your root document html which is evaluated into the display window.\\n\"],[10],[0,\"\\n\"],[7,\"img\"],[11,\"class\",\"tutorial-img\"],[12,\"src\",[29,\"concat\",[[25,[\"url\"]],\"new-project.png\"],null]],[9],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"Type the following html into the body to of the document and click the play button in the control bar. You should see the button appear in the display window \"],[10],[0,\"\\n\"],[7,\"h2\"],[9],[0,\"Part 2: Bringin' in Javascript\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"  \"],[7,\"code\"],[9],[0,\"\\n<button onclick=\\\"myFunction()\\\">Click me</button>\\n \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"Next, in the script tags type \"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"  \"],[7,\"code\"],[9],[0,\"\\nlet myFunction = ()=> {\\n  console.log(\\\"hello world\\\")\\n}\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nPause and play the code again and when you click the button, you should see \\\"hello world\\\" print out in the console at the bottom of the page.\\n\"],[10],[0,\"\\n\"],[7,\"img\"],[11,\"class\",\"tutorial-img\"],[12,\"src\",[29,\"concat\",[[25,[\"url\"]],\"console.png\"],null]],[9],[10],[0,\"\\n\"],[7,\"h2\"],[9],[0,\"Part 3: CSS and Tabs\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nNow were going to add some CSS to liven this button up abit. Instead of filling out our document with style tags, we're going to create a new tab to hold all our CSS.\\n\"],[10],[0,\"\\n\"],[7,\"img\"],[11,\"class\",\"tutorial-img\"],[12,\"src\",[29,\"concat\",[[25,[\"url\"]],\"createtab.gif\"],null]],[9],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nMake a new tab by clicking the plus next to the tabbar. Select the new tab, and by clicking on the main title, rename it \\\"styles\\\" (aside:CSS tabs can be names anything, we just pick this name for descriptive ease). Now add the following CSS into the new tab.\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"  \"],[7,\"code\"],[9],[0,\"\\nbutton {\\n  color:red;\\n}\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nRun the code. Your button doesnt change! This is because we need to tell the main page to include the CSS. Go back to root html document and add the following code to the <head>\\n\"],[10],[0,\"\\n\"],[7,\"pre\"],[9],[0,\"  \"],[7,\"code\"],[9],[0,\"\\n<link rel=\\\"stylesheet\\\" href=\\\"styles\\\" />\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nNow when you run the code your button title should be red. Fierce.\\n\"],[10],[0,\"\\n\"],[7,\"h2\"],[9],[0,\"Part 4: Javascript and Tabs\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nYou can also separate out javascript code. so we are going to make a new tab called \\\"printer\\\" and copy across the button handling code. Now delete the script tag and the code within it from the main document and insert the following code to the header\\n\"],[10],[0,\"\\n\\n\"],[7,\"pre\"],[9],[0,\"  \"],[7,\"code\"],[9],[0,\"\\n<script src = \\\"printer\\\"></script>\\n\"],[10],[0,\"\\n\"],[10],[0,\"\"],[7,\"img\"],[11,\"class\",\"tutorial-img\"],[12,\"src\",[29,\"concat\",[[25,[\"url\"]],\"finished.png\"],null]],[9],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nNow your button should greet the world as before when clicked, but its handling code is neatly stored away in a separate tab.\\n\"],[10],[0,\"\\n\"],[7,\"h2\"],[9],[0,\" What to do now? \"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  The full version of this project is available \"],[7,\"a\"],[12,\"href\",[23,\"beginnerProjectUrl\"]],[9],[0,\"here\"],[10],[0,\". You can also now\\n    \"],[7,\"ul\"],[9],[0,\"\\n      \"],[7,\"li\"],[9],[0,\"\\n        If you had trouble following, watch \"],[7,\"a\"],[11,\"href\",\"http://strangeloop.co.uk/js-videos/video3.html\"],[9],[0,\"a video\"],[10],[0,\" of Mick Grierson completing this guide. Then do the guide.\\n      \"],[10],[0,\"\\n      \"],[7,\"li\"],[9],[0,\"\\n        Check out the next more advanced \"],[7,\"a\"],[12,\"href\",[23,\"advancedurl\"]],[9],[0,\"walk through\"],[10],[0,\".\\n      \"],[10],[0,\"\\n      \"],[7,\"li\"],[9],[0,\"\\n        Check out \"],[7,\"a\"],[11,\"href\",\"https://mimicproject.com/guides/learner\"],[9],[0,\"how to use Learner.js\"],[10],[0,\", our library for making quick machine learning web apps.\\n      \"],[10],[0,\"\\n      \"],[7,\"li\"],[9],[0,\"\\n        Check out \"],[7,\"a\"],[11,\"href\",\"https://mimicproject.com/inputs\"],[9],[0,\"this collection of inputs and feature extractors\"],[10],[0,\" you can use to make machine learning project.\\n      \"],[10],[0,\"\\n      \"],[7,\"li\"],[9],[0,\"\\n        Check out \"],[7,\"a\"],[11,\"href\",\"https://mimicproject.com/guides/maxi-instrument\"],[9],[0,\"how to use MaxiInstrument.js\"],[10],[0,\", our library for making audio worklet instruments in the browser.\\n      \"],[10],[0,\"\\n      \"],[7,\"li\"],[9],[0,\"\\n        Check out \"],[7,\"a\"],[11,\"href\",\"https://mimicproject.com/guides/root\"],[9],[0,\"a bunch of other guides\"],[10],[0,\".\\n      \"],[10],[0,\"\\n      \"],[7,\"li\"],[9],[0,\"\\n        Check out \"],[7,\"a\"],[11,\"href\",\"https://mimicproject.com/examples/root\"],[9],[0,\"some more polished example projects\"],[10],[0,\".\\n      \"],[10],[0,\"\\n      \"],[7,\"li\"],[9],[0,\"\\n        Do the free \"],[7,\"a\"],[11,\"href\",\"https://www.futurelearn.com/courses/apply-creative-machine-learning\"],[9],[0,\"FutureLearn course:\"],[10],[0,\" Apply Creative Machine Learning. Its all about MIMIC.\\n      \"],[10],[0,\"\\n    \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\\n\"]],\"parameters\":[]}],[0,\"\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/getting-started.hbs" } });
});
;define("ember-share-db/templates/guides", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "YZY/K23J", "block": "{\"symbols\":[\"group\",\"index\",\"guide\"],\"statements\":[[4,\"if\",[[25,[\"isGuide\"]]],null,{\"statements\":[[7,\"div\"],[11,\"id\",\"tutorial-container\"],[9],[0,\"\\n\"],[7,\"h1\"],[9],[0,\" Guide to \"],[1,[25,[\"model\",\"name\"]],false],[0,\" \"],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"isKadenze\"]]],null,{\"statements\":[[1,[23,\"kadenze-guide\"],false],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"isMaxim\"]]],null,{\"statements\":[[1,[23,\"maximillian-guide\"],false],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"isMMLL\"]]],null,{\"statements\":[[1,[23,\"mmll-guide\"],false],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"isRAPIDMIX\"]]],null,{\"statements\":[[1,[23,\"rapidlib-guide\"],false],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"isEvolib\"]]],null,{\"statements\":[[1,[23,\"evolib-guide\"],false],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"isLearner\"]]],null,{\"statements\":[[1,[23,\"learner-guide\"],false],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"isMaxiInstruments\"]]],null,{\"statements\":[[1,[23,\"maxiinstrument-guide\"],false],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"isRecording\"]]],null,{\"statements\":[[1,[23,\"recording-guide\"],false],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"isColab\"]]],null,{\"statements\":[[1,[23,\"colab-guide\"],false],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[25,[\"isSupervisedML\"]]],null,{\"statements\":[[1,[23,\"supervised-ml-guide\"],false],[0,\"\\n\"]],\"parameters\":[]},null],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[7,\"div\"],[11,\"id\",\"tutorial-container\"],[9],[0,\"\\n\"],[7,\"h2\"],[9],[0,\"Guides\"],[10],[0,\"\\n\"],[7,\"h3\"],[9],[0,\"Simple code examples of MIMIC libraries and ML concepts\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nEach guide below uses a MIMIC library to demonstrate how to use machine intelligence to make music in the browser\\n\"],[10],[0,\"\\n\"],[4,\"each\",[[25,[\"model\"]]],null,{\"statements\":[[0,\"  \"],[7,\"h1\"],[9],[1,[24,1,[\"title\"]],false],[10],[0,\"\\n  \"],[7,\"div\"],[11,\"class\",\"row\"],[9],[0,\"\\n\"],[4,\"each\",[[24,1,[\"guides\"]]],null,{\"statements\":[[0,\"    \"],[1,[29,\"guide-tile\",null,[[\"onClick\",\"guide\",\"index\"],[[29,\"action\",[[24,0,[]],\"onClick\",[24,3,[]]],null],[24,3,[]],[24,2,[]]]]],false],[0,\"\\n\"]],\"parameters\":[3]},null],[10],[0,\"\\n\"]],\"parameters\":[1,2]},null],[10],[0,\"\\n\"]],\"parameters\":[]}]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/guides.hbs" } });
});
;define("ember-share-db/templates/head", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "kJcJ92cV", "block": "{\"symbols\":[],\"statements\":[[7,\"title\"],[9],[1,[25,[\"model\",\"title\"]],false],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/head.hbs" } });
});
;define("ember-share-db/templates/index", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "3EJFjMdd", "block": "{\"symbols\":[],\"statements\":[[7,\"html\"],[11,\"lang\",\"en\"],[9],[0,\"\\n\"],[1,[23,\"outlet\"],false],[0,\"\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/index.hbs" } });
});
;define("ember-share-db/templates/inputs", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "+5Yy2Ql5", "block": "{\"symbols\":[\"category\",\"index\",\"example\"],\"statements\":[[0,\"\\n\\n\"],[7,\"div\"],[11,\"id\",\"example-container\"],[11,\"class\",\"row\"],[9],[0,\"\\n  \"],[7,\"h2\"],[9],[0,\"Example Inputs\"],[10],[0,\"\\n  \"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  When building your own interactive systems using machine learning, or a dataset for any purpose, you'll need get some inputs from the world.\\n  \"],[10],[0,\"\\n  \"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  Below we have a whole collection of Javascript example projects, showing you how to use feature extractors in the browser to build datasets and models using the Learner.js library. For information, \"],[7,\"a\"],[11,\"href\",\"https://mimicproject.com/guides/learner\"],[9],[0,\"check out this guide\"],[10],[0,\" or investigate some of the projects below.\\n  \"],[10],[0,\"\\n\"],[4,\"each\",[[25,[\"examples\"]]],null,{\"statements\":[[0,\"    \"],[7,\"h1\"],[9],[1,[24,1,[\"title\"]],false],[10],[0,\"\\n    \"],[7,\"div\"],[11,\"class\",\"row\"],[9],[0,\"\\n\"],[4,\"each\",[[24,1,[\"docs\"]]],null,{\"statements\":[[0,\"      \"],[1,[29,\"example-tile\",null,[[\"onClick\",\"example\",\"index\"],[[29,\"action\",[[24,0,[]],\"onClick\",[24,3,[]]],null],[24,3,[]],[24,2,[]]]]],false],[0,\"\\n\"]],\"parameters\":[3]},null],[0,\"  \"],[10],[0,\"\\n\"]],\"parameters\":[1,2]},null],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/inputs.hbs" } });
});
;define("ember-share-db/templates/login", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "tq7sBrlZ", "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"id\",\"main-login-container\"],[11,\"class\",\"limited-width-container\"],[9],[0,\"\\n\"],[4,\"if\",[[25,[\"loginErrorMessage\"]]],null,{\"statements\":[[0,\"    \"],[7,\"p\"],[11,\"class\",\"login-message-label\"],[9],[1,[23,\"loginErrorMessage\"],false],[10],[0,\"\\n\"]],\"parameters\":[]},null],[7,\"form\"],[9],[0,\"\\n  \"],[7,\"ui\"],[11,\"class\",\"list-group\"],[9],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"list-group-item\"],[9],[0,\"\\n      \"],[7,\"label\"],[11,\"class\",\"login-label\"],[11,\"for\",\"identification\"],[9],[0,\"Username\"],[10],[0,\"\\n      \"],[1,[29,\"input\",null,[[\"class\",\"id\",\"placeholder\",\"value\"],[\"login-input\",\"identification\",\"\",[25,[\"identification\"]]]]],false],[0,\"\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"list-group-item\"],[9],[0,\"\\n      \"],[7,\"label\"],[11,\"class\",\"login-label\"],[11,\"for\",\"password\"],[9],[0,\"Password\"],[10],[0,\"\\n      \"],[1,[29,\"input\",null,[[\"class\",\"id\",\"placeholder\",\"type\",\"value\"],[\"login-input\",\"password\",\"\",\"password\",[25,[\"password\"]]]]],false],[0,\"\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n  \"],[7,\"p\"],[9],[7,\"button\"],[11,\"class\",\"login-btn\"],[11,\"type\",\"submit\"],[9],[0,\"Login\"],[10],[10],[0,\"\\n\\n\"],[3,\"action\",[[24,0,[]],\"authenticate\"],[[\"on\"],[\"submit\"]]],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"registerMessage\"]]],null,{\"statements\":[[0,\"  \"],[7,\"p\"],[11,\"class\",\"login-message-label\"],[9],[1,[23,\"registerMessage\"],false],[10],[0,\"\\n\"]],\"parameters\":[]},null],[7,\"form\"],[9],[0,\"\\n  \"],[7,\"ui\"],[11,\"class\",\"list-group\"],[9],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"list-group-item\"],[9],[0,\"\\n      \"],[7,\"label\"],[11,\"class\",\"login-label\"],[11,\"for\",\"newUsername\"],[9],[0,\"Username\"],[10],[0,\"\\n      \"],[1,[29,\"input\",null,[[\"class\",\"id\",\"placeholder\",\"value\"],[\"login-input\",\"newUsername\",\"\",[25,[\"newUsername\"]]]]],false],[0,\"\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"list-group-item\"],[9],[0,\"\\n      \"],[7,\"label\"],[11,\"class\",\"login-label\"],[11,\"for\",\"newUserEmail\"],[9],[0,\"Email (optional)\"],[10],[0,\"\\n      \"],[1,[29,\"input\",null,[[\"class\",\"id\",\"placeholder\",\"value\"],[\"login-input\",\"newUserEmail\",\"\",[25,[\"newUserEmail\"]]]]],false],[0,\"\\n      \"],[7,\"p\"],[11,\"style\",\"margin:10px 10px 0px 10px;\"],[9],[0,\"****If you do not give an email you will not be able to reset your password****\"],[10],[0,\"\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"list-group-item\"],[9],[0,\"\\n      \"],[7,\"label\"],[11,\"class\",\"login-label\"],[11,\"for\",\"newUserPassword\"],[9],[0,\"Password\"],[10],[0,\"\\n      \"],[1,[29,\"input\",null,[[\"class\",\"id\",\"placeholder\",\"type\",\"value\"],[\"login-input\",\"newUserPassword\",\"\",\"password\",[25,[\"newUserPassword\"]]]]],false],[0,\"\\n    \"],[10],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"list-group-item\"],[9],[0,\"\\n      \"],[7,\"label\"],[11,\"class\",\"login-label\"],[11,\"for\",\"newUserPasswordAgain\"],[9],[0,\"Password (again)\"],[10],[0,\"\\n      \"],[1,[29,\"input\",null,[[\"class\",\"id\",\"placeholder\",\"type\",\"value\"],[\"login-input\",\"newUserPasswordAgain\",\"\",\"password\",[25,[\"newUserPasswordAgain\"]]]]],false],[0,\"\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n    \"],[7,\"p\"],[9],[7,\"button\"],[11,\"class\",\"login-btn\"],[11,\"type\",\"submit\"],[9],[0,\"Create New User\"],[10],[10],[0,\"\\n\\n\"],[3,\"action\",[[24,0,[]],\"createNewUser\"],[[\"on\"],[\"submit\"]]],[10],[0,\"\\n\"],[7,\"form\"],[9],[0,\"\\n  \"],[7,\"ui\"],[11,\"class\",\"list-group\"],[9],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"list-group-item\"],[9],[0,\"\\n      \"],[7,\"label\"],[11,\"class\",\"login-label\"],[11,\"for\",\"resetUsername\"],[9],[0,\"Username\"],[10],[0,\"\\n      \"],[1,[29,\"input\",null,[[\"class\",\"id\",\"placeholder\",\"value\"],[\"login-input\",\"resetUsername\",\"\",[25,[\"resetUsername\"]]]]],false],[0,\"\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n  \"],[7,\"p\"],[9],[7,\"button\"],[11,\"class\",\"login-btn\"],[11,\"type\",\"submit\"],[9],[0,\"Reset Password\"],[10],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"resetMessage\"]]],null,{\"statements\":[[0,\"    \"],[7,\"p\"],[9],[1,[23,\"resetMessage\"],false],[10],[0,\"\\n\"]],\"parameters\":[]},null],[3,\"action\",[[24,0,[]],\"resetPassword\"],[[\"on\"],[\"submit\"]]],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/login.hbs" } });
});
;define("ember-share-db/templates/nime2020", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "tXS1NCli", "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"class\",\"limited-width-container\"],[9],[0,\"\\n\"],[7,\"h1\"],[9],[0,\"NIME 2020 Demo Session\"],[10],[0,\"\\n\"],[7,\"img\"],[12,\"src\",[23,\"mimicSupervisedLearningURL\"]],[11,\"style\",\"display: block;width:500px;margin:auto;padding:20px;\"],[9],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nLearner.js and MaxiInstruments.js are libraries to make musical machine learning web apps easy. They were used to make the demos below using minimal code. Check out the guides at the bottom for more details.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\nExamples currently run in \"],[7,\"strong\"],[9],[0,\"Google Chrome\"],[10],[0,\" only.\\n\"],[10],[0,\"\\n\"],[7,\"h1\"],[9],[0,\"Examples\"],[10],[0,\"\\n\"],[7,\"h3\"],[9],[0,\" Object Recognition Classification Example \"],[10],[0,\"\\n\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"height\",\"manualLoad\"],[\"a4c91621-199c-65b5-e355-2aadfc27c33f\",\"450px\",true]]],false],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[7,\"ol\"],[9],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"Use the drop down menu labelled “Class:” at the top of the Learner.js controls to change the current class. You should hear the drum beat change. \"],[10],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"Change the Class back to 0. Pick a neutral position (standing/sitting in the middle of the screen). Press record, and after a 2 second delay, 2 seconds of this pose will be recorded into Class 0 of the dataset. When we are recording, everytime a new frame of video is analysed, we take those features (the input) and store them alongside the class label (in this case 0).\"],[10],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"The MobileNet feature extractor is good at telling what different objects are in the picture. Pick 3 objects from around your desk that you can hold up to the camera. Remember, the model will have to learn to spot the differences between these objects so the more different they are, the better it will work.\"],[10],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"For each object, change the Class dropdown to a new class BEFORE you press record. Then record in some examples of you holding up that object. Record in a few 2-second runs, having more examples and more slight variations on each object will make your classifier more robust. For example, you might want to record examples of an object in slightly different locations / positions / rotations.\"],[10],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"When you have examples of all three classes, press Train. This will train the model then automatically Run when it is done. When the classifier is running, everytime a new frame of video is analysed, we take those features (the input) and run them through the classifier. It predicts which object it thinks you are holding and reacts accordingly\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"h3\"],[9],[0,\" Body Tracker Regression Example \"],[10],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"height\",\"manualLoad\"],[\"2fdd8ba2-3cb8-1838-49a5-fe9cfe6650ed\",\"450px\",true]]],false],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"ol\"],[9],[0,\"\\n    \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"\\n      We have set up Learner.js and MaxiInstruments.js to map several parameters of each synth, including the filters, reverb and pitch. When you press the “Randomise All” button, all of the mapped parameters will get new random values. You will see the sliders on the synth interfaces adjust as well. Our plan is to associate different positions and movements of your body to different sets of parameters. We can provide a few examples and then when we train the model, the regression will provide a continuous mapping and we can use the body as an expressive controller.\\n  \"],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"\\n    When you have found a sound you like, stand in one static pose. Hit Record and record in some values for about 3-4 seconds. Now every time you get a new camera reading, it will be saved in the dataset, alongside each of the current values of the mapped parameters. You should see the numbers of examples going up on the Learner.js interface. Repeat this process of finding a set of sounds you like using the random button (or manually adjusting), picking a body position and recording in a few more pose - sound combinations.\\n  \"],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"exercise-list-item\"],[9],[0,\"\\n    Hit “Train”. When it's ready, it will automatically start running. As with before, when you are running, everytime you get a new set of skeleton points from the camera, it will be fed into the model and the model will predict some new values for the synth parameters. These will then be applied in realtime to the synths (via a smoothing filter).\\n  \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"h1\"],[9],[0,\" Find out more \"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[11,\"style\",\"margin-bottom:70px;\"],[9],[0,\"\\n  \"],[7,\"ul\"],[9],[0,\"\\n    \"],[7,\"li\"],[9],[7,\"a\"],[11,\"class\",\"big-link\"],[11,\"href\",\"https://mimicproject.com/guides/learner\"],[9],[0,\"Learner.js Guide\"],[10],[10],[0,\"\\n    \"],[7,\"li\"],[9],[7,\"a\"],[11,\"class\",\"big-link\"],[11,\"href\",\"https://mimicproject.com/guides/maxi-instrument\"],[9],[0,\"MaxiInstruments.js Guide \"],[10],[10],[0,\"\\n    \"],[7,\"li\"],[9],[7,\"a\"],[11,\"class\",\"big-link\"],[11,\"href\",\"https://mimicproject.com/inputs\"],[9],[0,\"Feature Extractors\"],[10],[10],[0,\"\\n    \"],[7,\"li\"],[9],[7,\"a\"],[11,\"class\",\"big-link\"],[11,\"href\",\"https://www.futurelearn.com/courses/apply-creative-machine-learning\"],[9],[0,\"Take the FutureLearn Course \\\"Apply Creative Machine Learning\\\". Its free. \"],[10],[10],[0,\"\\n\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/nime2020.hbs" } });
});
;define("ember-share-db/templates/outputs", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "2gqC1SEn", "block": "{\"symbols\":[\"category\",\"index\",\"example\"],\"statements\":[[7,\"div\"],[11,\"id\",\"example-container\"],[11,\"class\",\"row\"],[9],[0,\"\\n  \"],[7,\"h2\"],[9],[0,\"Example Outputs\"],[10],[0,\"\\n  \"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  The best part of building musical machine learning systems is, well, the music!\\n  \"],[10],[0,\"\\n  \"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  Below we have a whole collection of Javascript example projects showing you how you can control your musical projects using models trained with the the Learner.js library. For more information, \"],[7,\"a\"],[11,\"href\",\"https://mimicproject.com/guides/learner\"],[9],[0,\"check out this guide\"],[10],[0,\" or investigate some of the projects below. For more on the MaxiInstruments library \"],[7,\"a\"],[11,\"href\",\"https://mimicproject.com/guides/maxi-instrument\"],[9],[0,\"check out this guide\"],[10],[0,\".\\n  \"],[10],[0,\"\\n\"],[4,\"each\",[[25,[\"examples\"]]],null,{\"statements\":[[0,\"    \"],[7,\"h1\"],[9],[1,[24,1,[\"title\"]],false],[10],[0,\"\\n    \"],[7,\"div\"],[11,\"class\",\"row\"],[9],[0,\"\\n\"],[4,\"each\",[[24,1,[\"docs\"]]],null,{\"statements\":[[0,\"      \"],[1,[29,\"example-tile\",null,[[\"onClick\",\"example\",\"index\"],[[29,\"action\",[[24,0,[]],\"onClick\",[24,3,[]]],null],[24,3,[]],[24,2,[]]]]],false],[0,\"\\n\"]],\"parameters\":[3]},null],[0,\"  \"],[10],[0,\"\\n\"]],\"parameters\":[1,2]},null],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/outputs.hbs" } });
});
;define("ember-share-db/templates/password-reset", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "t+jVPmPr", "block": "{\"symbols\":[],\"statements\":[[4,\"if\",[[25,[\"hasValidToken\"]]],null,{\"statements\":[[0,\"  \"],[7,\"div\"],[9],[0,\"\\n    \"],[7,\"h1\"],[9],[0,\"RESET YOUR PASSWORD\"],[10],[0,\"\\n    \"],[7,\"div\"],[11,\"class\",\"container\"],[9],[0,\"\\n    \"],[7,\"form\"],[9],[0,\"\\n      \"],[7,\"label\"],[11,\"for\",\"password\"],[9],[0,\"Password\"],[10],[0,\"\\n      \"],[1,[29,\"input\",null,[[\"id\",\"placeholder\",\"type\",\"value\"],[\"password\",\"Enter Password\",\"password\",[25,[\"password\"]]]]],false],[0,\"\\n      \"],[7,\"label\"],[11,\"for\",\"passwordAgain\"],[9],[0,\"Password (again)\"],[10],[0,\"\\n      \"],[1,[29,\"input\",null,[[\"id\",\"placeholder\",\"type\",\"value\"],[\"passwordAgain\",\"Enter Password (again)\",\"password\",[25,[\"passwordAgain\"]]]]],false],[0,\"\\n      \"],[7,\"button\"],[11,\"type\",\"submit\"],[9],[0,\"Reset Password\"],[10],[0,\"\\n\"],[4,\"if\",[[25,[\"resetMessage\"]]],null,{\"statements\":[[0,\"        \"],[7,\"p\"],[9],[1,[23,\"resetMessage\"],false],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"    \"],[3,\"action\",[[24,0,[]],\"resetPassword\"],[[\"on\"],[\"submit\"]]],[10],[0,\"\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"  \"],[7,\"div\"],[9],[0,\"\\n    \"],[7,\"h1\"],[9],[0,\"NICE TRY\"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"]],\"parameters\":[]}]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/password-reset.hbs" } });
});
;define("ember-share-db/templates/people", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "toEKhFC+", "block": "{\"symbols\":[\"person\",\"index\"],\"statements\":[[7,\"div\"],[11,\"id\",\"example-container\"],[11,\"class\",\"row\"],[9],[0,\"\\n\"],[7,\"h1\"],[11,\"style\",\"text-align:center\"],[9],[0,\"The MIMIC Project Team\\n\"],[10],[0,\"\\n\"],[4,\"each\",[[25,[\"people\"]]],null,{\"statements\":[[0,\"    \"],[1,[29,\"people-tile\",null,[[\"onClick\",\"person\",\"index\"],[[29,\"action\",[[24,0,[]],\"onClick\",[24,1,[]]],null],[24,1,[]],[24,2,[]]]]],false],[0,\"\\n\"]],\"parameters\":[1,2]},null],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/people.hbs" } });
});
;define("ember-share-db/templates/techyard", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "mC6WYwMu", "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"class\",\"limited-width-container\"],[9],[0,\"\\n\\n\"],[7,\"h1\"],[9],[0,\"Tech Yard Demos\"],[10],[0,\"\\n\\n\"],[7,\"h2\"],[9],[0,\"1. Impulses\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  In order to tell the speaker how to move in and out, we send it a stream of numbers. In fact, we send over 40,000 numbers \"],[7,\"strong\"],[9],[0,\" every second!\"],[10],[0,\". This stream of numbers is often called a signal and we can use maths and computer programs to generate these signals.\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"ul\"],[9],[0,\"\\n    \"],[7,\"li\"],[9],[7,\"strong\"],[9],[0,\"When we send a 1\"],[10],[0,\": this moves to speaker fully out\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[7,\"strong\"],[9],[0,\"When we send a -1\"],[10],[0,\": this moves it fully in\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[7,\"strong\"],[9],[0,\"When its 0\"],[10],[0,\": the speaker is in its normal position\"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  The first signal we're going to send to the speaker tells it to move in and out (up to 1 and then down to 0) for really short amount of time, followed by a pause. When the gap between these is long, you will hear this is a series of individual short sounds.\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  As we make the gaps between the spikes shorter, the sounds get quicker and eventually, they begin to sound like one continuous sound. Even better, as they get faster, the pitch of the sound will get higher!\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  We're able to play with this ourselves using the program below. What are we looking at?\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"ul\"],[9],[0,\"\\n    \"],[7,\"li\"],[9],[7,\"strong\"],[9],[0,\"Play/Stop Button\"],[10],[0,\": Use the big green circular button in the top left to start and stop the sound\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[7,\"strong\"],[9],[0,\"Pitch Slider\"],[10],[0,\": The slider in the bottom right controls how fast we send the spikes to the speaker\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[7,\"strong\"],[9],[0,\"Oscilloscope\"],[10],[0,\": The display under the Play Button in the bottom right shows us the signal that we are currently sending to the speaker\"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"h3\"],[9],[0,\"Task\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  You first task is to get comfortable using this interface\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"ul\"],[9],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"Can you start and stop the sound?\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"Can you change the speed of the spikes using the slider?\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"At what speed does the sound stop sounding like lots of short sounds, and start sounding like one long sound?\"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[2,\" Impulse \"],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"height\",\"manualLoad\"],[\"3bd8a4b1-8d1f-dd1b-f61a-27e2b7a4f88f\",\"350px\",false]]],false],[0,\"\\n\\n\"],[7,\"h2\"],[9],[0,\"2. Triangle Waves\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  So now we have a pitched sound, but only once its going fast, and its not a very nice sound! We can get a much more musical sound by smoothly moving up to 1, then smoothly down to -1. This is called a \"],[7,\"strong\"],[9],[0,\"Triangle Wave\"],[10],[0,\", because it looks like a triangle! In the same way as before, the faster we move in and out, the higher pitched the sound becomes.\\n\"],[10],[0,\"\\n\\n\"],[7,\"h3\"],[9],[0,\"Task\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  Use the program below to play with the triangle wave, using the slider to alter the pitch\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"ul\"],[9],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"How is this sound different to the first sound?\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"Do you prefer the lower or higher sounds?\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"What is lowest sound you can still hear?\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"Can you use this slider to play a song like an instrument?\"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[2,\" Triangle \"],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"height\",\"manualLoad\"],[\"16e26851-9342-0d64-b48f-b541e1f1e976\",\"350px\",false]]],false],[0,\"\\n\\n\"],[7,\"h2\"],[9],[0,\"3. Volume and Square Waves\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  So we know that how fast we move between 1 and -1 determines the pitch of the sound. Now we'll see that the range of the numbers we go up and down to controls the volume of the sound. For example, if instead of going between 1 and -1, we go between 0.5 and -0.5, the sound will be quieter!\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  You can use the slider on the program below in 2 dimensions to control the sound. Left and right controls the pitch, and up and down controls the volume.\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  In the demo below, we've also changed the shape of the wave again, which makes a different sound. Instead of smoothly moving in a line, or doing short bursts, we move to the top, stay there for a while, then move back down again and stay there. This is called a \"],[7,\"strong\"],[9],[0,\"Square Wave\"],[10],[0,\" because, you've guessed it, it looks like a square.\\n\"],[10],[0,\"\\n\\n\"],[7,\"h3\"],[9],[0,\"Task\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  Use the program below to play with the wave wave, using the slider to alter the pitch (left and right) and the volume (up and down)\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"ul\"],[9],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"How is this sound different to the triangle wave?\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"Can you see the wave get taller and shorter when the volume gets higher and lower?\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"Can you use this slider to play a song like an instrument? Does having control over the volume make it better?\"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[2,\" Square Amp \"],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"height\",\"manualLoad\"],[\"bd83bd36-feb9-885c-077e-d892b80ebc24\",\"350px\",false]]],false],[0,\"\\n\\n\\n\"],[7,\"h2\"],[9],[0,\"4. Noise\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  Finally, we'll look at what happens if you just use random numbers to control the speaker. This is called noise! Where have you heard sounds like this before?\\n\"],[10],[0,\"\\n\\n\"],[7,\"h3\"],[9],[0,\"Task\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  Use the slider to change the volume of the noise. Look how the waveform gets bigger and smaller as the sound gets louder and quieter.\\n\"],[10],[0,\"\\n\\n\"],[2,\" Noise \"],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"height\",\"manualLoad\"],[\"5f2d6495-46db-8d54-50f1-a0960d8e7aad\",\"350px\",false]]],false],[0,\"\\n\\n\"],[7,\"h2\"],[9],[0,\"5. Sound Files\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  Instead of making the signals for the speakers using maths, we can record sounds from the physical world, and play these back! Although the sounds and signal look a lot more complicated, the principles are actually exactly the same. In fact, all recorded sounds are just combinations of the simple waves we have seen, starting at different points and changing speed and volume in different ways over time.\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  Take a look at this audio file, you can see that the it has similar waves to the oscilloscope signal we saw when making the electronic sounds earlier.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  Click the waveform to play the sound and watch as the playhead moves across the sample. This is signal that is being sent to the speaker to move it in and out!\\n\"],[10],[0,\"\\n\\n\"],[2,\" Short Waveform \"],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"height\",\"manualLoad\"],[\"\\n5ac1cfbb-0498-445e-b8ab-f126ba4a19dd\",\"300px\",false]]],false],[0,\"\\n\\n\"],[7,\"h3\"],[9],[0,\"Changing the Speed\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  In the same way that we move up and down faster or slower to change the pitch of the electronic sounds, we can move through the audio file slower or faster.\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"ul\"],[9],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"Moving through the audio file \"],[7,\"strong\"],[9],[0,\"slowly\"],[10],[0,\" makes the sound appear lower pitched and also the events happen more slowly \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"Moving through the audio file \"],[7,\"strong\"],[9],[0,\"quickly\"],[10],[0,\" makes the sound appear higher pitched and also the events happen more quickly\"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"h3\"],[9],[0,\"Task\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  Here we have two different audio files. One is some instruments and another is a drump loop. Try the tasks below with both files to hear the differences.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"ul\"],[9],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"Click on the audio files to start playing, and click again to pause. You will see the progress bar move as you move through the audio file. Can you see the louder parts of the sound happen when the waveform is bigger? \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"Use the slider underneather the waveform to speed up and slow down the playback. You can see the progress bar move at different speeds and listen to the results\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"Set the speed to really slow and listen for a while as it moves through the file. It almost sounds like a completely different song!\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"What do you think happens when we move through the audio file backwards?\"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[2,\" Pitch change soul sample \"],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"height\",\"manualLoad\"],[\"\\ne6123cba-cab9-b34f-2fec-65f20a693c6e\",\"350px\",false]]],false],[0,\"\\n\\n\"],[2,\" Pitch change drum sample \"],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"height\",\"manualLoad\"],[\"\\nbe63fe09-64e2-bf2e-639f-d648c2c6864a\",\"350px\",false]]],false],[0,\"\\n\\n\"],[7,\"h2\"],[9],[0,\"6. Sequencing Changes in Sound Files\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  Whilst its fun to play with sliders by hand to control the how the computer plays back the audio files, one of the great things about computers is we can program them to change over time by themselves. This is known as \"],[7,\"strong\"],[9],[0,\" Sequencing\"],[10],[0,\".\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  The program below is a bit more complicated than other ones we've used so lets go through it carefully.\\n\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"ul\"],[9],[0,\"\\n    \"],[7,\"li\"],[9],[7,\"strong\"],[9],[0,\" The Waveforms\"],[10],[0,\": There are two tracks, an instrumental track and a drum track. When these play, you'll see the playhead move across the waveform like in the earlier examples\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[7,\"strong\"],[9],[0,\" The Sequencer\"],[10],[0,\": There is also a sequencer underneath, and this controls where in audio file we play from and what speed we move through the audio file at a given time step\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"Using this, we can program in a pattern that jumps around the audio files and repitches the audio to make a new track!\"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"h3\"],[9],[0,\"Task Part 1\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  First we're just going to play and watch the sequence play through\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"ul\"],[9],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"Hit the \\\"PLAY\\\" button at the bottom\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"Watch as the sequencer moves along underneath the audio files. Also look how the text at the end changes when it reaches a new time step telling you where the audio is skipping to and what the pitch is\"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[2,\" Pitch position sequencer \"],[0,\"\\n\"],[1,[29,\"embedded-project\",null,[[\"docId\",\"height\",\"manualLoad\"],[\"\\n7c367fdb-2ebb-3841-22e6-c6435674a048\",\"700px\",false]]],false],[0,\"\\n\\n\"],[7,\"h3\"],[9],[0,\"Programming the Sequencer\"],[10],[0,\"\\n\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"ul\"],[9],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"The sequencer at the bottom moves through 8 different steps one after another.\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"At each step there is an instruction stored about how to play back each of the two  tracks, either by changing the speed, or skipping to another point in the audio file.\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"When you click on a square on the sequencer, you can see which instructions are stored there on the sliders and labels above.\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"You can then use these sliders to change the instructions for that particular time step.\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"To change the instructions for another time step, just click on another square on the sequencer. You'll know which one you're currently working with because it will be filled in green!\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"The top row controls Track 1, and the bottom row Track 2.\"],[10],[0,\"\\n  \"],[10],[0,\"\\n\\n\"],[10],[0,\"\\n\\n\"],[7,\"h3\"],[9],[0,\"Task Part 2\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  Sequencing the start position of Track 1. First follow our instructions to get a feel for how it works, then try making your tracks.\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"ul\"],[9],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      Program to skip to audio file back to beginning (position 0) at time step 2\\n      \"],[7,\"br\"],[9],[10],[7,\"br\"],[9],[10],[0,\"\\n      \"],[7,\"ol\"],[9],[0,\"\\n        \"],[7,\"li\"],[9],[0,\"\\n          Click on the 2nd square in the top row of the sequence.\\n        \"],[10],[0,\"\\n        \"],[7,\"li\"],[9],[0,\"\\n          Then move the Position slider down from 0.125 to 0.\\n        \"],[10],[0,\"\\n      \"],[10],[0,\"\\n      \"],[7,\"br\"],[9],[10],[0,\"\\n      \"],[10],[0,\"\\n      \"],[7,\"li\"],[9],[0,\"\\n        Program to skip to audio file back to beginning (position 0) at time step 3\\n        \"],[7,\"br\"],[9],[10],[7,\"br\"],[9],[10],[0,\"\\n        \"],[7,\"ol\"],[9],[0,\"\\n          \"],[7,\"li\"],[9],[0,\"\\n            Click on the 3rd square in the top row of the sequence.\\n          \"],[10],[0,\"\\n          \"],[7,\"li\"],[9],[0,\"\\n            Then move the Position slider down from 0.25 to 0.\\n          \"],[10],[0,\"\\n        \"],[10],[0,\"\\n        \"],[7,\"br\"],[9],[10],[0,\"\\n        \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"Do this for the 4th square as well. Listen to the audio playback and watch the playhead as the audio file loops back to the beginning four times in a row at the sequencer plays\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"Try this for some of the others squares with different start positions to make your own track. Try changing Track 2 as well!\"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"h3\"],[9],[0,\"Task Part 3\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  Sequencing the pitch of both tracks\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n  \"],[7,\"ul\"],[11,\"style\",\"\"],[9],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"\\n      Program to start playing back the audio at half the speed at time step 4\\n      \"],[7,\"br\"],[9],[10],[7,\"br\"],[9],[10],[0,\"\\n      \"],[7,\"ol\"],[9],[0,\"\\n        \"],[7,\"li\"],[9],[0,\"\\n          Click on the 4th square in the top row of the sequence\\n        \"],[10],[0,\"\\n        \"],[7,\"li\"],[9],[0,\"\\n          Then move the Pitch slider down from 1 to 0.5\\n        \"],[10],[0,\"\\n      \"],[10],[0,\"\\n      \"],[7,\"br\"],[9],[10],[0,\"\\n      \"],[10],[0,\"\\n      \"],[7,\"li\"],[9],[0,\"\\n        Program to start playing back the audio at 1.5 times the speed at time step 5\\n        \"],[7,\"br\"],[9],[10],[7,\"br\"],[9],[10],[0,\"\\n        \"],[7,\"ol\"],[9],[0,\"\\n          \"],[7,\"li\"],[9],[0,\"\\n            Click on the 5th square in the top row of the sequence\\n          \"],[10],[0,\"\\n          \"],[7,\"li\"],[9],[0,\"\\n            Then move the Pitch slider up from 1 to 1.5\\n          \"],[10],[0,\"\\n        \"],[10],[0,\"\\n        \"],[7,\"br\"],[9],[10],[0,\"\\n        \"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"Listen to the audio playback and watch the playhead as the audio file slows down and speeds up when it reaches the time steps on the sequencer. You should be able to hear the pitch getting higher and lower\"],[10],[0,\"\\n    \"],[7,\"li\"],[9],[0,\"Try this for some of the others squares with different pitches to make your own track. Try changing Track 2 as well!\"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"  \"],[7,\"br\"],[9],[10],[0,\"  \"],[7,\"br\"],[9],[10],[0,\"  \"],[7,\"br\"],[9],[10],[0,\"  \"],[7,\"br\"],[9],[10],[0,\"\\n\"],[7,\"h2\"],[9],[0,\" AND WE'RE DONE. THANKS. YOU'RE GREAT.\"],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"  \"],[7,\"br\"],[9],[10],[0,\"  \"],[7,\"br\"],[9],[10],[0,\"  \"],[7,\"br\"],[9],[10],[0,\"  \"],[7,\"br\"],[9],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"tutorial-text\"],[9],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/techyard.hbs" } });
});
;define("ember-share-db/templates/terms", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "JFNitGs9", "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"id\",\"terms-container\"],[9],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"MIMIC PROJECT –TERMS OF USE\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"p2\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[7,\"span\"],[11,\"class\",\"Apple-tab-span\"],[9],[0,\"\\t\"],[10],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Welcome to The Mimic Project Website, an online system to support code learning and teaching. The Mimic Project Website has been created by the Goldsmiths' College Department of Computing.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"DEFINITIONS AND INTERPRETATION\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"In the The Mimic Project Website T&Cs: * words and phrases that have special definitions are capitalised, and are displayed in bold when first defined; * Goldsmiths’ College is referred to as: “We”, “Us” and “Our”; You are referred to as: “You” and “Your”; * if You are not allowed to do something, then You are also not allowed to attempt to do it, nor to get anyone else to do it or attempt to do it on Your behalf; * section and paragraph headings are for convenience only; they do not effect the meaning of any provisions.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"DESCRIPTION OF THE MIMIC PROJECT WEBSITE\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"The Mimic Project Website is a hosting service that allows You to: * register as a user (a “User”) and create a user account (an “Account”); * Join or be joined with other Users into one or more groups (“Communities”); * upload and edit code, upload media assets (“Content”); * Look at Content previously uploaded by You or by other Users in the same Community; * participate in forums (“Forums”) and add comments (“Comments”) relating to Content previously uploaded by You or other Users in the same Community. * Content You upload and Comments You add are together referred to as “Submissions”; You remain wholly responsible for Your Submissions.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"The Mimic Project Website also forms part of our research projects. As part of this, We will collect data and information about Your use of The Mimic Project Website, in line with our Privacy Policy.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"The Mimic Project Website T&CS These Terms of Use govern Your use of: * the The Mimic Project Website website (the “Website”); * the The Mimic Project Website system (the “System”); * any associated The Mimic Project Website services (the “Services”). The Website, the System and the Services are together referred to as “The Mimic Project Website”.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Please read these Terms of Use very carefully, in conjunction with our Privacy Policy, Cookie Policy, Copyright Policy, and Community Guidelines. Together these are referred to as the “The Mimic Project Website T&Cs”, and they form a legally binding agreement between You and Us. If You do not agree with any of the provisions set out in the The Mimic Project Website T&Cs, You should not use The Mimic Project Website in any way.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"AMENDING THE THE MIMIC PROJECT WEBSITE T&CS\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"We may modify or amend the The Mimic Project Website T&Cs at any time without notice. We may require You to acknowledge that You have read and understood the latest version of the The Mimic Project Website T&Cs before logging into the Website. Even if We do not do so, by using The Mimic Project Website in any way, You are agreeing to abide by the latest version of the The Mimic Project Website T&Cs.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"USERS TO USE THE MIMIC PROJECT WEBSITE\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"You must first be registered with a User Account. You may register a User Account for Yourself if: * You are over 18 years of age, or You are 13 years of age or older and have the consent of a parent or legal guardian; * You do not already have a User Account; and * You have not previously had a User Account terminated. If You are registered on a Coursera course operated by Us, You may use Your Coursera log-in to access The Mimic Project Website as long as the above stipulations apply.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"If You have previously had a User Account terminated You need Our explicit permission to set up a new User account. For more information please contact: \"],[7,\"a\"],[11,\"href\",\"mailto:m.grierson@arts.ac.uk\"],[9],[0,\"Mick Grierson\"],[10],[0,\".\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"When You register as a User, You must provide Us with Your real name and a valid email address, and Your date of birth if You are under-18. You must update Us if and when these details change. You must not register pretending to be any other person, entity or organisation. When You register as a User You must select a unique username and password. You may not register a username that is blasphemous or offensive, or infringes any third party rights. We may require You to change Your username or password at any time for any reason.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"You are responsible for keeping Your password secret. You are responsible for any use that is made of Your account by any person who gains access to it (unless this is a result of Our error). If You believe Your username or password has been lost or stolen, or that an unauthorised third party has accessed or attempted to access Your Account, change Your password immediately and notify Us as soon as possible by emailing: \"],[7,\"a\"],[11,\"href\",\"mailto:m.grierson@arts.ac.uk\"],[9],[0,\"Mick Grierson\"],[10],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"YOUR USE OF THE MIMIC PROJECT WEBSITE\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Subject to You abiding by the The Mimic Project Website T&Cs, We hereby grant You a right and licence while You have an Account (that has not been suspended or terminated) to: * make Submissions by uploading and posting Your own Content and participating in Forums and adding Comments relating to Your Communities; * stream, review and listen to Content and Submissions previously uploaded by You or other Users in Your Communities; * use any Services which We offer to You. We may suspend or remove Your rights at our sole discretion on a temporary or permanent basis at any time without notice.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"You must only use The Mimic Project Website and the Website in the manner that it is intended to be used. You must not: * attempt to circumvent any security measures; * introduce any virus, trojan horse, worm, spyware, adware, logic bomb or any other malware, or destructive content or material; * launch any denial of service or analogous attack; * use any automated system that sends more request messages than a human can produce in a given period of time using a standard unmodified web browser; * do anything else designed to interfere with or disrupt the normal operation of The Mimic Project Website; * copy or replicate The Mimic Project Website or the Website, or any part of it; * download, copy, adapt, reverse engineer, decompile or modify any The Mimic Project Website source or object code; * alter or remove any trade mark, copyright or other proprietary or legal notices on the Website or in any Submissions.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"In using The Mimic Project Website and the Website You further agree not to make any Submissions or undertake any action that: * discriminates directly or indirectly against any person on the basis of age, disability, gender reassignment, marital or civil partner status, pregnancy or maternity, race, colour, nationality, ethnic or national origin, religion or belief, sex or sexual orientation; * is abusive, offensive, obscene, indecent, libelous or defamatory; * promotes violence, terrorism, or illegal acts; * infringes the rights of any third parties including any copyright, trade marks, rights of privacy or confidential information; * breaches any law, rule, regulation, court order or is otherwise illegal; * includes unsolicited or unauthorised advertising or promotional materials; * does not in any other way meet our Community Guidelines.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"SUBMISSIONS\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"As a hosting service, We do not guarantee that We will review or edit any Submissions before they are uploaded to the Website (although We reserve the right to do so), nor do We claim ownership of any Submissions. You acknowledge that You are solely responsible for any Submissions You upload to the Website. When You upload a Submission to the Website You are warranting that You have the right to do so, and that the Submission You are uploading: * matches any description You provide; * does not infringe the copyright, or any other intellectual property rights, of any third party; * is not blasphemous, defamatory or offensive, or in breach of any applicable law or regulation. If You upload Submissions in breach of this, Your account may be suspended or terminated, and as in the case of any breach of copyright or other intellectual property rights the relevant rights-holder owner might also chose to take action. For more information about copyright infringement please see our Guide to Copyright.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"If You believe any Submissions are in breach of these The Mimic Project Website T&Cs please notify us by using the Report button, or by emailing us at \"],[7,\"a\"],[11,\"href\",\"mailto:m.grierson@arts.ac.uk\"],[9],[0,\"Mick Grierson\"],[10],[0,\".\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"REPORTING INFRINGEMENT OF COPYRIGHT OR OTHER IP RIGHTS\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"If you believe any Submission breaches Your copyright or other intellectual property rights, please email us with as full details as possible at [computing@gold.ac.uk].\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"We endeavor to remove such potentially-infringing Submissions within a commercially-reasonable period of time after receiving such notification while we investigate the position.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"LICENCE\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"By uploading Content You are granting Us, and other Users of The Mimic Project Website who are members of Your Communities from time to time, a non-exclusive royalty-free right and licence to stream and listen to Your Content, and to participate in Forums and post Comments relating to Your Content.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Unless You have an independent right to do so unconnected with Your use of The Mimic Project Website or Your relationship with Us, You must not: * download, rip, scrape, aggregate, or in any other way capture or attempt to capture Submissions; * copy, issue copies, rent, lend, perform, communicate or make an adaptation of any Submissions.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"We do not guarantee to keep copies of any Submissions. If You withdraw Content from Your Account, it will no longer be visible to Users but We reserve the right to retain the relevant files on our servers, in line with out Privacy Policy.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"COMMUNITIES\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Communities are administered by one or more convenors (“Convenors”). Participation in a Community is at the sole discretion of the relevant Convenors. We may at Our sole discretion allow You to be a Convenor and form Your own Communities. Convenors do not take any responsibility for any Submissions made to their relevant Communities. Subject to abiding by the The Mimic Project Website T&Cs, and in particular the stipulations described under the heading Your use of The Mimic Project Website, Convenors may suspend or terminate participation of any User in any Community at their sole discretion.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"WARRANTIES\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"The Mimic Project Website, the Website, the System and the Services are provided on an “as is” basis. We do not offer any warranty or guarantee to You that they are fit for any particular purpose or that they will function or operate in any particular way, or at all. Our liability to You in relation to Your use of The Mimic Project Website is limited to the fullest extent permitted by law.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Notwithstanding the foregoing, any liability We may have to You (whether arising in contract, tort or otherwise) arising in any way out of the subject matter of this agreement or Your use of The Mimic Project Website, will not extend to any indirect damages or losses, or to any loss of profits, loss of revenue, loss of data, loss of contracts or opportunity (whether direct or indirect), even if You have advised Us of the possibility of those losses, or if they were within Our contemplation. Our aggregate liability to You (whether arising in contract, tort or otherwise) for all and any breaches of this agreement, any negligence or arising in any other way out of the subject matter of this agreement or Your use of The Mimic Project Website will not exceed in total one pound sterling (£1 GBP). Nothing in this agreement limits or excludes liability for death or personal injury caused by negligence, or for any other sort of liability which may not be excluded under mandatory law.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"INDEMNIFICATION\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"You will indemnify Us, and Our Council members, officers, employees, students, contractors, agents, advisors, and other representatives (the “Indemnified Parties”), and keep them fully and effectively indemnified, against each and every claim made by a third party against any of the Indemnified Parties as a result of Your breach of the The Mimic Project Website T&Cs, your infringement of any third party intellectual property rights, or your breach of any law or regulation in any jurisdiction.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"TERMINATION\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"We may suspend or terminate Your Account at our sole discretion if We believe You have done anything that: * is or may be a breach of the The Mimic Project Website T&Cs; * is or may be an infringement of the rights of any third party; or * is or may be a breach or any applicable law or regulation in any jurisdiction.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"You may terminate Your account at any time.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Termination of Your Account is irreversible. When Your account is terminated, all Content You have uploaded will immediately become unavailable from the The Mimic Project Website Website and will be deleted from the The Mimic Project Website System (including any back-ups) within two months.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Notwithstanding, the termination of Your account for any reason whatsoever, We reserve the right to keep and use data relating to Your use of The Mimic Project Website as detailed in our Privacy Policy.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Any relevant provisions of the The Mimic Project Website T&Cs will continue to apply to You irrespective of the termination of Your Account for any reason whatsoever.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"THIRD PARTY SERVICES\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"The Website and Submissions made by Users may contain links or other information relating to websites and other services operated by third parties (referred to as “Third Party Services”).\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"In relation to such Third Party Services You acknowledge that: * We do not endorse, monitor or exert any control over Third Party Services; * We do not make any express or implied warranties or representations with regard to the legality, quality, accuracy or fitness for purpose of such Third Party Services; * You are responsible for reviewing all terms and conditions applicable to any Third Party Service and satisfying yourself of their safety and suitability before entering into any sort of financial or other transaction with a Third Party Service; * We do not accept any liability in relation to any use You may make of such Third Party Services, and You hereby irrevocably waive any claim against Us with respect to the content or operation of any Third Party Services. (including, for the sake of clarity, in relation to any fraud, or damage or loss caused by any virus, worm, Trojan horse and/or any other destructive content or material);\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"EQUALITY AND HUMAN RIGHTS\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"You acknowledge that as a UK-based public institution We are under various legal obligations to promote equality and human rights. You undertake that in using The Mimic Project Website You will: * refrain from discriminating directly or indirectly against any person on the basis of age, disability, gender reassignment, marital or civil partner status, pregnancy or maternity, race, colour, nationality, ethnic or national origin, religion or belief, sex or sexual orientation; * comply with and act in a way which is compatible with the European Convention on Human Rights and all applicable legislation and regulations relating to equality and non-discrimination, including any legislation and/or regulations implementing the Equal Treatment Directive (Directive 2006/54/EC).\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"WHOLE AGREEMENT.\"],[7,\"span\"],[11,\"class\",\"Apple-converted-space\"],[9],[0,\" \"],[10],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"The Mimic Project Website T&Cs comprising these Terms of Use, together with the Privacy Policy, Cookie Policy, Copyright Policy, and Community Guidelines, constitute the whole agreement between Us and You regarding Your use of The Mimic Project Website. They supersede any previous versions of the The Mimic Project Website T&Cs. Any modification to the The Mimic Project Website T&Cs must be made in writing.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"You acknowledge that You have not agreed to the The Mimic Project Website T&Cs on the basis of any warranty, representation, statement, agreement or undertaking except those expressly set out in the The Mimic Project Website T&Cs. You waive any claim for breach of the The Mimic Project Website T&Cs, or any right to rescind Your agreement to the The Mimic Project Website T&Cs, in respect of any representation which is not an express provision of the The Mimic Project Website T&Cs (other than in respect to any fraudulent misrepresentation or fraudulent concealment).\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"THIRD PARTIES\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Neither You nor Us may assign rights or responsibilities under these The Mimic Project Website T&Cs to any third party without the other’s written permission. No third party may enforce any benefit conferred by the The Mimic Project Website T&Cs.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"SEVERABILITY\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"If the whole or any part of any provision of the The Mimic Project Website T&Cs is void or unenforceable in any jurisdiction, the other provisions, and the rest of the void or unenforceable provision, shall continue in force in that jurisdiction, and the validity and enforceability of that provision in any other jurisdiction shall not be affected\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"LAW AND JURISDICTION\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Except where otherwise required by the mandatory law of the United States or any member state of the European Union, the The Mimic Project Website T&Cs and the relationship between Us and You is governed by, and is to be construed in accordance with, English law. The English Courts shall have exclusive jurisdiction to deal with any dispute which has arisen or may arise out, of or in connection with, the The Mimic Project Website T&Cs and the relationship between Us and You, except that We may bring proceedings for an interim injunction or other equitable relief (or any similar or equivalent remedy) in any jurisdiction.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"You acknowledge that in the event of a breach of the The Mimic Project Website T&Cs by Us or any third party, any damage or harm caused to You will not entitle You to seek injunctive or other equitable relief against Us (including with respect to Your Content). Your only remedy shall be for monetary damages, subject to the limitations of liability set forth in these Terms of Use.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"THE MIMIC PROJECT WEBSITE COMMUNITY GUIDELINES\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"INTRODUCTION\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"These Community Guidelines outline the basic standards of behaviour We require from Users of The Mimic Project Website. They describe both how You should treat other Users, and how in return You should expect to be treated by other Users.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"If You believe another User is failing to meet these Community Guidelines, or is otherwise making You feel threatened or uncomfortable, then please inform Us by using the Flag button, or by emailing Us at computing@gold.ac.uk.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"GUIDELINES\"],[10],[10],[0,\"\\n\"],[7,\"ul\"],[11,\"class\",\"ul1\"],[9],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"li1\"],[9],[7,\"span\"],[11,\"class\",\"s2\"],[9],[10],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Always treat other Users as You would wish to be treated yourself.\"],[10],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"li1\"],[9],[7,\"span\"],[11,\"class\",\"s3\"],[9],[10],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Try to keep Your comments relevant and stick to the topic under discussion; there are many general social networking sites and forums around – The Mimic Project Website is not one of these.\"],[10],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"li1\"],[9],[7,\"span\"],[11,\"class\",\"s3\"],[9],[10],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Be civil and don't say anything on The Mimic Project Website You wouldn't say in a face to face conversation – and remember that online statements can easily be misinterpreted as there aren’t non-‐verbal cues to clarify what is intended.\"],[10],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"li1\"],[9],[7,\"span\"],[11,\"class\",\"s3\"],[9],[10],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Be tolerant of the behaviour of other The Mimic Project Website Users and assume they will generally be acting in good faith.\"],[10],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"li1\"],[9],[7,\"span\"],[11,\"class\",\"s3\"],[9],[10],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"When commenting on Submissions made by other Users try to use praise and constructive criticism. Avoid making negative comments about the efforts of other Users. Some examples of different types of “praise” and “criticism” are given below.\"],[10],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"li1\"],[9],[7,\"span\"],[11,\"class\",\"s3\"],[9],[10],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"It is not wrong to disagree with another User, but when doing so reply to the argument -‐ do not make personal attacks. In many cases, You will be arguing about opinions and there may be no objectively right answer. Remember that other Users have different thoughts and beliefs to You and that they may be just as passionate as You are about defending these.\"],[10],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"li1\"],[9],[7,\"span\"],[11,\"class\",\"s3\"],[9],[10],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Do not in any circumstances make defamatory, false or prejudiced statements, and do not bully, make “trolling” comments or otherwise provoke other Users.\"],[10],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"li1\"],[9],[7,\"span\"],[11,\"class\",\"s3\"],[9],[10],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Do not reveal private or personal information relating to other Users without their consent.\"],[10],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"EXAMPLES OF TYPES OF PRAISE AND CRITICISM\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"“Praise” can be defined as a ‘ Positive expression of approval’ -‐ e.g.:\"],[10],[10],[0,\"\\n\"],[7,\"ul\"],[11,\"class\",\"ul1\"],[9],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"li3\"],[9],[7,\"span\"],[11,\"class\",\"s3\"],[9],[10],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Evaluative Praise: “Sick”, “Nice one”;\"],[10],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"li3\"],[9],[7,\"span\"],[11,\"class\",\"s3\"],[9],[10],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Descriptive Praise: “Great use of a for loop in your program.”;\"],[10],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"li3\"],[9],[7,\"span\"],[11,\"class\",\"s3\"],[9],[10],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Constructive Praise: “The program you wrote was really interesting but it would be even better if you tried to use a for loop instead of having all those similar looking lines of code. ”\"],[10],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"“Criticism” can be defined as a: ‘ Negative expression of disapproval’ – e.g.:\"],[10],[10],[0,\"\\n\"],[7,\"ul\"],[11,\"class\",\"ul1\"],[9],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"li1\"],[9],[7,\"span\"],[11,\"class\",\"s3\"],[9],[10],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Evaluative Criticism: “That was bad”, “You are bad”;\"],[10],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"li1\"],[9],[7,\"span\"],[11,\"class\",\"s3\"],[9],[10],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Descriptive Criticism: “That was bad because You are using the wrong coding techmique”;\"],[10],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"li1\"],[9],[7,\"span\"],[11,\"class\",\"s3\"],[9],[10],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Constructive Criticism: “The for loop wasn’t as good as it could be – I wonder if You could use a while loop?”\"],[10],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Please try to use Praise when commenting on Submissions from other Users. If You are going to use Criticism, please try to ensure it is Constructive Criticism; avoid Descriptive or Evaluative Criticism.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"The Mimic Project Website Community Guidelines v1.2\"],[7,\"br\"],[9],[10],[0,\"\\n© Goldsmiths’ College 2014-‐15 -‐ last amended 25th March 2017.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"The Mimic Project Website\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"GUIDE TO COPYRIGHT AND MORAL RIGHTS\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"DISCLAIMER\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"The following guide is intended as a basic guide to copyright and moral rights – it is not intended to and does not constitute formal legal advice. We cannot accept any liability in relation to any reliance You may place on the information\"],[7,\"br\"],[9],[10],[0,\"\\ncontained in this guide; You are advised to consult a suitably-‐qualified lawyer or other professional if You need formal legal advice about copyright and related issues.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Although copyright law is to some extent standardised internationally, details vary in different jurisdictions; this guide is based on the position under English law.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"DEFINITION OF COPYRIGHT\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"The term “copyright” describes the rights that an owner of copyright in a particular work has to control how the work is used. Under UK law, copyright applies to the following types of original work: * literary, dramatic, musical or artistic works; * sound recordings, films and broadcasts; * the typographical arrangement of published editions.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"A “literary work” includes a table or compilation, a computer programme, and a database; a “dramatic work” includes a work of dance or mime.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Copyright does not apply to ideas as such, but only to ideas once they are given material expression through one of the above types of work. Copyright arises automatically, it does not need to be registered (though there are advantages of doing so in some jurisdictions. You cannot assume that a work is not subject to copyright just because it does not display a visible © symbol.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"A single piece of work may have multiple copyrights which can be owned by different people. For example, a pop song may have separate copyrights in the lyrics, the music and the sound recording. Any use of that song would require permission from all of the copyright owners.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"RIGHTS OF A COPYRIGHT OWNER\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"The owner of copyright in a work has a number of exclusive rights in relation to that work, namely: * to copy the work; * to issue copies of the work to the public; * to rent or lend the work to the public; * to perform, show or play the work in public;\"],[7,\"br\"],[9],[10],[0,\"\\n* to communicate the work to the public; * to make an adaptation of the work or do any of the above in relation to an adaptation.\"],[7,\"br\"],[9],[10],[0,\"\\nWith a few limited exceptions it is an infringement of copyright to do any of the above to a copyright work (or a substantial part thereof) without the permission of the copyright owner. In the case of joint ownership of copyright, permission is required from all copyright owners. As described above, where a single piece of work such as a pop song is subject to multiple copyrights, permission is required from all of the owners of all of the different copyrights.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"OWNERSHIP OF COPYRIGHT\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Generally, the first owner of copyright in a work is the author or authors (unless the work is created by an employee in the course of their duties) though that copyright will often be licensed or assigned to a third party– e.g. to record companies or music publishers.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"It is generally easy to understand who the author is of a literary, dramatic, musical or artistic work. In the case of a literary, dramatic, musical or artistic work which is computer-‐generated, the author shall be taken to be the person by whom the arrangements necessary for the creation of the work are undertaken.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"In relation to other copyright works, the author or authors are deemed to be: * In the case of a sound recording, the producer; * In the case of a film, the producer and the principal director; * In the case of a broadcast, the person making the original broadcast;\"],[7,\"br\"],[9],[10],[0,\"\\n* In the case of the typographical arrangement of a published edition, the publisher.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"DURATION OF COPYRIGHT\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"The duration of copyright varies in different jurisdictions and in relation to different types of copyright work. In the UK the most important are as follows: * literary, dramatic, musical or artistic works – 70 years from the end of the calendar year in which the last author dies. (If a work is computer-‐ generated copyright expires 50 years from the end of the calendar year in which the work was made). * sound recordings – 50 years from the year of recording, or of publication or communication to the public (if later); * films -‐ 70 years from the end of the calendar year of the death of the last to die of the principal director, the author of the screenplay, the author of the dialogue, or the composer of music specially created for and used in the film; * the typographical arrangement of published editions – 25 years from the calendar year in which the edition was first published.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"There are further rules that govern the duration of copyright when the author or authors are unknown, or when the authors come from outside an EE state. This is outside the scope of this guide.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Wikipedia has more information on copyright term lengths here: http://en.wikipedia.org/wiki/List_of_countries'_copyright_lengths\"],[7,\"br\"],[9],[10],[0,\"\\n\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"MORAL RIGHTS\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Many jurisdictions also recognise what are termed “moral rights”. In the UK these are:\"],[7,\"br\"],[9],[10],[0,\"\\n* The right to be identified as the author or director of a copyright work; * The right to object to derogatory treatment of a work; * The right to object to false attribution of a work; * The right to privacy of certain photographs and films commissioned for private and domestic purposes.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Moral rights cannot be assigned, so remain with the author or director (or their estate); moral rights can however be waived.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"AVOIDING COPYRIGHT INFRINGEMENT\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"The easiest way to avoid copyright infringement is to ensure that all of Your Submissions to The Mimic Project Website are original. Otherwise, You need to be sure that You either have the permission of all the relevant copyright owners (which would normally take the form of a formal copyright licence), or that all the relevant copyright terms have expired. If You are not sure – please don’t make the Submission!\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"FURTHER INFORMATION\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"For further information about copyright and related issues please see: * The World Intellectual property Organization: http://www.wipo.int/copyright/en/ * The UK Intellectual Property Office – http://www.ipo.gov.uk/types/copy.htm * The Copyright Licensing Agency – http://www.cla.co.uk/copyright_information/copyright_information\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"The Mimic Project Website Guide to Copyright and Moral Rights v1.2\"],[7,\"br\"],[9],[10],[0,\"\\n© Goldsmiths’ College 2014-‐15 -‐ last amended 24 March 2017.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"The Mimic Project Website\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"PRIVACY POLICY\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"INTRODUCTION\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"This Privacy Policy explains how We process personal information We collect from You, or You provide to Us, when You use The Mimic Project Website. It also includes Our Cookie Policy.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Any capitalised terms not defined in this Privacy Policy are defined in Our Terms of Use.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"AMENDING THE PRIVACY POLICY\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[7,\"br\"],[9],[10],[0,\"\\nWe may modify or amend this Privacy Policy at any time without notice. We may require You to acknowledge that You have read and understood the latest version of the Privacy Policy before using The Mimic Project Website. Even if We do not do so, by using The Mimic Project Website in any way You are agreeing to abide by the latest version of the Privacy Policy.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"INFORMATION WE MAY COLLECT ABOUT YOU\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Information you provide\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Registration information: if You register a User account with Us, We will collect Your name, Your username and Your encrypted password.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Submission information: You may chose to include personal information in Submissions You make.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Correspondence information: if You correspond with Us (e.g. by regular mail, fax\"],[7,\"br\"],[9],[10],[0,\"\\nor email) You may chose to include personal information.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Information collected automatically\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Technical information: * The Internet Protocol (IP) address of the device You are using to access The Mimic Project Website; * The type of device You use to access The Mimic Project Website; * The operating system and type of browser You use; * The last website you visited prior to accessing The Mimic Project Website; * Information collected through cookies, as described below; * Information on how you respond to email messages We may send You.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Details of Your activities on The Mimic Project Website, including: * The times and dates you access The Mimic Project Website; * How long you spend on The Mimic Project Website; * The Mimic Project Website pages you visit; * Submissions you view; * Submissions you make; * Search terms You enter.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"HOW WE USE YOUR PERSONAL INFORMATION\"],[7,\"span\"],[11,\"class\",\"Apple-converted-space\"],[9],[0,\" \"],[10],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"We use Your personal information for the purposes of operating The Mimic Project Website, including: * to identify You as a User; * to identify Submissions you make; * to personalise how The Mimic Project Website appears to You. We also use Your personal information in connection with the 'The Mimic Project Website: browser based creative coding leading to deeper learning and wider skills acquisition'. research project as described in Our Research Ethics Policy.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"SHARING YOUR PERSONAL INFORMATION\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"We share Your personal information with other Users who view Your Submissions, including Your username and any personal information You chose to include in Your Submissions.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"We may share Your personal information in anonymised form in academic reports, meetings, conferences and journals in accordance with Our Research Ethics Policy.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"We reserve the right to provide Your personal information to third parties where in Our reasonable opinion We are required to do so by virtue of any law, regulation or order of any competent Court.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Unless You have asked Us to delete Your information as described below, We may transfer Your personal information to any person or company that takes over all or part of The Mimic Project Website, including without limitation, to any person or entity taking over the operation of The Mimic Project Website after the end of the research project.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"DELETING PERSONAL INFORMATION\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"We reserve the right to store Your personal information (including any Submissions You have made) until 31 Oct 2018, or 9 months after the end of the research project (whichever is the later).\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"If You want Us to delete the personal information We hold about You after the above date please email Us at: computing@gold.ac.uk.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"If Your User account is terminated for any reason whatsoever We may delete Your personal information at any point thereafter, but We do not guarantee to do so.\"],[7,\"br\"],[9],[10],[0,\"\\nNotwithstanding the foregoing We reserve the right to retain some or all of Your personal information where We believe this to be reasonably necessary in order to satisfy Our legal obligations, or where We have another legitimate reason for doing so.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"CHILDREN Where Users are accessing The Mimic Project Website because they are participating in the London Chamber Orchestra’s Music Junction project, we collect personal information only with the explicit consent of their parent or guardian.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Apart from the foregoing, The Mimic Project Website is not intended for use by under-‐13s, we do not knowingly collect any personal information from under-‐13s, and under-‐ 13s are not permitted to register a User account with Us, or to access The Mimic Project Website via a Coursera log-‐in.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"If it comes to Our attention that We have inappropriately collected personal data from a person under the age of 13, We will delete this as soon as possible. If you believe We have inappropriately collected personal data from a person under the age of 13, please notify Us immediately at info@musiccircleproject.com.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"HOSTING\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"The Mimic Project Website is hosted by Goldsmiths College, University of London.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"LEGAL INFORMATION\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Under UK law, We are obliged to inform you of the name of the ‘”data controller”, responsible for how Your personal information is processed; Goldsmiths’ College is the 'data controller' for The Mimic Project Website.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"If You would like a copy of the personal information We hold about You, or have any questions about how We may use it, please email: info@musiccircleproject.com.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"COOKIE POLICY\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"A “Cookie” is a small text file that is stored on Your computer, and which enables Us to store certain details about You, in order to, for example, keep track of what you do on The Mimic Project Website, or to customise how The Mimic Project Website appears to You.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Currently The Mimic Project Website only uses one cookie, which is a “session” cookie. This keeps track of You as a User once you have logged into The Mimic Project Website for the duration of Your visit to The Mimic Project Website. When you leave The Mimic Project Website this cookie is automatically deleted.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"You can turn off cookies through Your browser settings, but You will then be unable to access The Mimic Project Website.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"The Mimic Project Website Privacy Policy v1.2 © Goldsmiths’ College 2014-‐15 -‐ last amended 24.03.17.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"The Mimic Project Website\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"RESEARCH ETHICS POLICY\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"INTRODUCTION NB: Any capitalised terms not defined in this Research Ethics Policy are defined in Our Terms of Use.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"As detailed in Our Terms of Use, The Mimic Project Website is part of an AHRC funded research project entitled “Musically Intelligent Machines Interacting Creatively”.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"This Research Ethics Policy explains how We use data collected from You specifically in connection with this research project (“Research Data”). It should be read in conjunction with Our Privacy Policy, which explains how We generally process any personal information We collect from You, or You provide to Us, when You use The Mimic Project Website.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"RESEARCH DATA\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Our Research Data comprises the following:\"],[10],[10],[0,\"\\n\"],[7,\"ul\"],[11,\"class\",\"ul1\"],[9],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"li3\"],[9],[7,\"span\"],[11,\"class\",\"s3\"],[9],[10],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Your Submissions to The Mimic Project Website;\"],[10],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"For more information about Google Analytics, please see Our Privacy Policy.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"If You access The Mimic Project Website using Your Coursera log-‐in, We may also use information supplied to Us by Coursera (e.g. survey answers You provide to Coursera).\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"NAMED RESEARCHERS\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"The Research Data will be accessed by the following named researchers:\"],[10],[10],[0,\"\\n\"],[7,\"ul\"],[11,\"class\",\"ul1\"],[9],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"li1\"],[9],[7,\"span\"],[11,\"class\",\"s2\"],[9],[10],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Professor Mick Grierson\"],[10],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"li1\"],[9],[7,\"span\"],[11,\"class\",\"s2\"],[9],[10],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Dr Matthew Yee-King\"],[10],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"li1\"],[9],[7,\"span\"],[11,\"class\",\"s2\"],[9],[10],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Dr Rebecca Fiebrink\"],[10],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"The Research Data may also be accessed by researchers appointed by Us to work on the research project in the future.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"WHAT IS THE PURPOSE OF THE RESEARCH?\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"Our research is exploring the use of programming environments in the learning of coding.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"WHY HAVE YOU BEEN CHOSEN?\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[7,\"br\"],[9],[10],[0,\"\\nWe are collecting Research Data from everyone using The Mimic Project Website so that We can improve the design and functionality of The Mimic Project Website.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"DO YOU HAVE TO TAKE PART?\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[7,\"br\"],[9],[10],[0,\"\\nIt is up to You whether or not to take part, but You cannot use The Mimic Project Website if You do not wish to participate in the research. You are free to withdraw at any time and without giving a reason.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[7,\"br\"],[9],[10],[0,\"\\nWHAT IS BEING TESTED?\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[7,\"br\"],[9],[10],[0,\"\\nWe are investigating the strengths and weaknesses of The Mimic Project Website, to see how well it supports the learning of programming.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"WHAT ARE THE POSSIBLE DISADVANTAGES AND RISKS OF TAKING PART?\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[7,\"br\"],[9],[10],[0,\"\\nWe do not foresee any disadvantages of taking part in the study.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"WHAT ARE THE POSSIBLE BENEFITS TO TAKING PART?\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[7,\"br\"],[9],[10],[0,\"\\nYour feedback will help improve a resource which We hope will be beneficial to students.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"WHAT WILL HAPPEN TO THE RESULTS OF THE RESEARCH PROJECT?\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[7,\"br\"],[9],[10],[0,\"\\nThe results may be presented in academic reports, meetings, conferences and publications. All data and audio-‐visual material presented will be anonymous.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"WILL MY TAKING PART IN THIS RESERACH BE KEPT CONFIDENTIAL?\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[7,\"br\"],[9],[10],[0,\"\\nOther Users of The Mimic Project Website that You interact with would know by implication that You are taking part in this research, but all the Research Data We collect from You will be anonymised and Your identity will never be disclosed in any academic reports, meetings, conferences or publications.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"WHO IS FUNDING THE RESEARCH?\"],[7,\"br\"],[9],[10],[0,\"\\nThis research is funded by the Arts and Humanities Research Council.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"CONTACT FOR FURTHER INFORMATION\"],[7,\"br\"],[9],[10],[0,\"\\nFor more information, please contact: computing@gold.ac.uk\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"YOUR CONSENT\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"If you are over 18, then by using The Mimic Project Website You agree to the following statements:\"],[10],[10],[0,\"\\n\"],[7,\"ul\"],[11,\"class\",\"ul1\"],[9],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"li3\"],[9],[7,\"span\"],[11,\"class\",\"s3\"],[9],[10],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"You confirm that You have read and understand this Research Ethics Policy.\"],[10],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"li3\"],[9],[7,\"span\"],[11,\"class\",\"s3\"],[9],[10],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"You understand that Your participation is voluntary and that You are free to withdraw at any time without giving any reason.\"],[10],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"li3\"],[9],[7,\"span\"],[11,\"class\",\"s3\"],[9],[10],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"You understand that the researchers named above will have access to the Research Data collected during this project.\"],[10],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"li3\"],[9],[7,\"span\"],[11,\"class\",\"s3\"],[9],[10],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"You agree that the anonymised findings may be used in academic reports, publications and academic presentations.\"],[10],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"li3\"],[9],[7,\"span\"],[11,\"class\",\"s3\"],[9],[10],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"You agree to take part in the research project.\"],[10],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"If you are under 18, then by using The Mimic Project Website You confirm that Your parent or guardian agrees to the following statements:\"],[10],[10],[0,\"\\n\"],[7,\"ul\"],[11,\"class\",\"ul1\"],[9],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"li3\"],[9],[7,\"span\"],[11,\"class\",\"s3\"],[9],[10],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"They confirm that they have read and understand this Research Ethics Policy.\"],[10],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"li3\"],[9],[7,\"span\"],[11,\"class\",\"s3\"],[9],[10],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"They understand that Your participation is voluntary and that You are free to withdraw at any time without giving any reason.\"],[10],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"li3\"],[9],[7,\"span\"],[11,\"class\",\"s3\"],[9],[10],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"They understand that the researchers named above will have access to the Research Data collected during this project.\"],[10],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"li3\"],[9],[7,\"span\"],[11,\"class\",\"s3\"],[9],[10],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"They agree that the anonymised findings may be used in academic reports, publications and academic presentations.\"],[10],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"li3\"],[9],[7,\"span\"],[11,\"class\",\"s3\"],[9],[10],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"They agree that You may take part in the research project.\"],[10],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"AMENDING THE RESEARCH ETHICS POLICY\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"We may modify or amend this Research Ethics Policy at any time without notice. We may require You to acknowledge that You, or your parent or guardian if You are under 18, have read and understood the latest version of the Research Ethics Policy before using The Mimic Project Website. Even if We do not do so, by using The Mimic Project Website in any way, You are agreeing to abide by the latest version of the Research Ethics Policy. Notwithstanding the foregoing, Our use of Research Data shall be governed by the Research Ethics Policy in place when the Research Data was collected.\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[0,\"The Mimic Project Website Research Ethics Policy v1.0\"],[10],[10],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"terms-text\"],[9],[7,\"span\"],[11,\"class\",\"s1\"],[9],[7,\"br\"],[9],[10],[0,\"\\n© Goldsmiths’ College 2014-‐19 -‐ last amended 26th February 2019.\"],[10],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-share-db/templates/terms.hbs" } });
});
;define('ember-share-db/utils/api-data-manager', ['exports', 'ember-railio-grid/utils/api-data-manager'], function (exports, _apiDataManager) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _apiDataManager.default;
    }
  });
});
;define('ember-share-db/utils/array-data-manager', ['exports', 'ember-railio-grid/utils/array-data-manager'], function (exports, _arrayDataManager) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _arrayDataManager.default;
    }
  });
});
;define('ember-share-db/utils/data-manager', ['exports', 'ember-railio-grid/utils/data-manager'], function (exports, _dataManager) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _dataManager.default;
    }
  });
});
;define('ember-share-db/utils/filterer', ['exports', 'ember-railio-grid/utils/filterer'], function (exports, _filterer) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _filterer.default;
    }
  });
});
;define('ember-share-db/utils/filtering-handler', ['exports', 'ember-railio-grid/utils/filtering-handler'], function (exports, _filteringHandler) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _filteringHandler.default;
    }
  });
});
;define('ember-share-db/utils/paginating-handler', ['exports', 'ember-railio-grid/utils/paginating-handler'], function (exports, _paginatingHandler) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _paginatingHandler.default;
    }
  });
});
;define('ember-share-db/utils/paginator', ['exports', 'ember-railio-grid/utils/paginator'], function (exports, _paginator) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _paginator.default;
    }
  });
});
;define('ember-share-db/utils/sorter', ['exports', 'ember-railio-grid/utils/sorter'], function (exports, _sorter) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _sorter.default;
    }
  });
});
;define('ember-share-db/utils/sorting-handler', ['exports', 'ember-railio-grid/utils/sorting-handler'], function (exports, _sortingHandler) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _sortingHandler.default;
    }
  });
});
;

;define('ember-share-db/config/environment', [], function() {
  var prefix = 'ember-share-db';
try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(decodeURIComponent(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

});

;
          if (!runningTests) {
            require("ember-share-db/app")["default"].create({"name":"ember-share-db","version":"0.0.0+57ca74f7"});
          }
        
//# sourceMappingURL=ember-share-db.map
