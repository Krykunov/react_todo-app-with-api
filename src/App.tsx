/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */

import * as postService from './api/todos';
import { UserWarning } from './UserWarning';
import TodoItem from './components/TodoItem';
import Header from './components/Header';
import Footer from './components/Footer';
import ErrorNotification from './components/ErrorNotification';
import DevHelper from './components/DevHelper';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useTodos } from './hooks/useTodos';

export const App: React.FC = () => {
  const {
    todos,
    filtered,
    tempTodo,
    activeFilter,
    setActiveFilter,
    editingTodos,
    isLoading,
    errorMessage,
    setErrorMessage,
    addTodo,
    deleteTodo,
    handleClearCompleted,
    handleToggleCompleted,
    handleToggleAll,
  } = useTodos();

  if (!postService.USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      {/*'remove before deploy !!!'*/}
      <DevHelper
        onSetFakeTodos={addTodo}
        onDeleteAllTodos={deleteTodo}
        todos={todos}
      />
      {/*'remove before deploy !!!'*/}
      <h1 className="todoapp__title">todos</h1>
      <div className="todoapp__content">
        <Header
          todos={todos}
          onCreateTodo={addTodo}
          isLoading={isLoading}
          setErrorMessage={setErrorMessage}
          handleToggleAll={handleToggleAll}
        />

        <section className="todoapp__main" data-cy="TodoList">
          <TransitionGroup>
            {filtered.map(todo => (
              <CSSTransition key={todo.id} timeout={300} classNames="item">
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onDelete={deleteTodo}
                  editingTodos={editingTodos}
                  handleToggleCompleted={handleToggleCompleted}
                />
              </CSSTransition>
            ))}
            {tempTodo && (
              <CSSTransition key={0} timeout={300} classNames="item">
                <TodoItem
                  key={tempTodo.id}
                  todo={tempTodo}
                  onDelete={deleteTodo}
                  editingTodos={editingTodos}
                  handleToggleCompleted={handleToggleCompleted}
                />
              </CSSTransition>
            )}
          </TransitionGroup>
        </section>

        {todos.length > 0 && (
          <Footer
            todos={todos}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            handleClearCompleted={handleClearCompleted}
          />
        )}
      </div>
      <ErrorNotification
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
    </div>
  );
};
