const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'angularTodo',

  exposes: {
    // Expose the TodoList feature component — avoids shell router conflicts
    // (App component has RouterOutlet; TodoListComponent is self-contained)
    './TodoList': './src/app/features/todo-list/todo-list.component.ts',
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },

  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket'],

  features: {
    ignoreUnusedDeps: true,
  },
});
