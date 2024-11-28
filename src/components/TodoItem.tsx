/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */

import cn from 'classnames';

import React from 'react';
import { Todo } from '../types/Todo';

type Props = {
  todo: Todo;
  onDelete: (id: number) => void;
  editingTodos: number[];
  handleToggleCompleted: (id: number) => void;
};

const TodoItem: React.FC<Props> = ({
  todo,
  onDelete,
  editingTodos,
  handleToggleCompleted,
}) => {
  const handleDelete = () => {
    onDelete(todo.id);
  };

  const handleToggle = () => {
    handleToggleCompleted(todo.id);
  };

  return (
    <div
      key={todo.id}
      data-cy="Todo"
      className={cn('todo', { completed: todo.completed })}
    >
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={todo.completed}
          onChange={handleToggle}
        />
      </label>

      <span data-cy="TodoTitle" className="todo__title">
        {todo.title}
      </span>

      <button
        type="button"
        className="todo__remove"
        data-cy="TodoDelete"
        onClick={handleDelete}
      >
        ×
      </button>

      <div
        data-cy="TodoLoader"
        className={cn('modal overlay', {
          'is-active': editingTodos.includes(todo.id),
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};

export default TodoItem;
