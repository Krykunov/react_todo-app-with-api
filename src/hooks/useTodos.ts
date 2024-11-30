import { useCallback, useEffect, useMemo, useState } from 'react';
import { filterTodos } from '../utils/services';
import * as postService from '../api/todos';

import { Filters, Todo } from '../types/Todo';

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<Filters>(Filters.All);
  const [editingTodos, setEditingTodos] = useState<number[]>([]);
  const [renamingTodo, setRenamingTodo] = useState<number | null>(null);

  const isAllCompleted = todos.every(todo => todo.completed);

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
    setIsLoading(true);

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
        setIsLoading(false);
      });
  };

  const loadTodos = useCallback(() => {
    setIsLoading(true);
    postService
      .getTodos()
      .then(setTodos)
      .catch(() => setErrorMessage('Unable to load todos'))
      .finally(() => setIsLoading(false));
  }, []);

  const updateTodo = (newTodo: Todo) => {
    setIsLoading(true);
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
        setIsLoading(false);
      });
  };

  const deleteTodo = useCallback((id: number) => {
    setIsLoading(true);
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
      .finally(() => setIsLoading(false));
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

  const handleToggleAll = () => {
    todos.forEach(todo => {
      const updatedTodo: Todo = {
        ...todo,
        completed: !isAllCompleted,
      };

      updateTodo(updatedTodo);
    });
  };

  const handleUpdateTodoTitle = (id: number, title: string) => {
    const newTodo = todos.find(todo => todo.id === id);

    if (!newTodo) {
      setErrorMessage('Todo not found');

      return;
    }

    const updatedTodo: Todo = {
      ...newTodo,
      title,
    };

    updateTodo(updatedTodo);
  };

  useEffect(() => {
    loadTodos();
  }, []);

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
    isLoading,
    errorMessage,
    setErrorMessage,
    addTodo,
    updateTodo,
    deleteTodo,
    handleClearCompleted,
    handleToggleCompleted,
    handleToggleAll,
    isAllCompleted,
    renamingTodo,
    setRenamingTodo,
    handleUpdateTodoTitle,
  };
};
