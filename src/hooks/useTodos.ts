import { useCallback, useEffect, useMemo, useState } from 'react';
import { filterTodos } from '../utils/services';
import * as postService from '../api/todos';

import { Todo } from '../types/Todo';

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [editingTodos, setEditingTodos] = useState<number[]>([]);

  const filtered = useMemo(
    () => filterTodos(todos, activeFilter),
    [todos, activeFilter],
  );

  const addTodo = (title: string) => {
    setTempTodo({
      id: 0,
      userId: postService.USER_ID,
      title: title,
      completed: false,
    });
    setLoading(true);

    return postService
      .createTodo(title)
      .then(newTodo => {
        setEditingTodos(current => [...current, 0]);

        setTodos(currentTodos => [...currentTodos, newTodo]);
      })
      .catch(() => {
        setErrorMessage('Unable to add a todo');
        throw new Error('Unable to add a todo');
      })
      .finally(() => {
        setTempTodo(null);
        setLoading(false);
      });
  };

  const loadTodos = useCallback(() => {
    setLoading(true);
    postService
      .getTodos()
      .then(setTodos)
      .catch(() => setErrorMessage('Unable to load todos'))
      .finally(() => setLoading(false));
  }, []);

  const updateTodo = (newTodo: Todo) => {
    setLoading(true);
    setEditingTodos(current => [...current, newTodo.id]);

    return postService
      .updateTodo(newTodo)
      .then(() => {
        setTodos(currentTodos => {
          const newTodos = [...currentTodos];
          const index = newTodos.findIndex(todo => todo.id === newTodo.id);

          newTodos.splice(index, 1, newTodo);

          return newTodos;
        });
      })
      .catch(error => {
        setErrorMessage('Unable to update a todo');
        throw new Error(error);
      })
      .finally(() => {
        setEditingTodos([]);
        setLoading(false);
      });
  };

  const deleteTodo = useCallback((id: number) => {
    setLoading(true);
    setEditingTodos(current => [...current, id]);
    postService
      .deleteTodo(id)
      .then(() => {
        setTodos(currentTodos => currentTodos.filter(todo => todo.id !== id));
      })
      .catch(() => {
        setErrorMessage('Unable to delete a todo');
        setEditingTodos([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleClearCompleted = () => {
    const completedTodos = todos.filter(todo => todo.completed);

    completedTodos.forEach(todo => {
      setEditingTodos(current => [...current, todo.id]);
      deleteTodo(todo.id);
    });
  };

  const handleToggleCompleted = (id: number) => {
    const newTodo = todos.find(todo => todo.id === id);

    if (!newTodo) {
      setErrorMessage('Todo not found');

      return;
    }

    const updatedTodo: Todo = {
      ...newTodo,
      completed: !newTodo.completed,
    };

    updateTodo(updatedTodo);
  };

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  useEffect(() => {
    if (errorMessage) {
      setTimeout(() => setErrorMessage(''), 3000);
    }
  }, [errorMessage]);

  return {
    todos,
    filtered,
    activeFilter,
    setActiveFilter,
    tempTodo,
    editingTodos,
    loading,
    errorMessage,
    setErrorMessage,
    addTodo,
    updateTodo,
    deleteTodo,
    handleClearCompleted,
    handleToggleCompleted,
  };
};
