<script>
  import { afterUpdate } from 'svelte';
  import { onMount } from 'svelte';

  onMount(() => {
    fetch("http://localhost:4000/API/tasks")
      .then( res => {
        if (!res.ok) {
          throw new Error("Failed!")
        }
        return res.json();
      }).then(data => {
        backEndData = Object.values(data.todos);
        let newData = backEndData.map(function(el){
          let newObj = {
            id: el._id.$oid,
            text: el.name.text,
            checked: el.name.checked
          }
          return newObj;
        })
        todoItems = newData;
      })
      .catch(err => {
        console.log(err);
      })
  })

  afterUpdate(() => {
    document.querySelector('.js-todo-input').focus();
  });

  let todoItems = [];
  let newTodo = '';
  let backEndData = [];

  function addTodo() {
    newTodo = newTodo.trim();
    if (!newTodo) return;

    const todo = {
      text: newTodo,
      checked: false,
      id: Date.now(),
    };

    todoItems = [...todoItems, todo];
    newTodo = '';

    fetch("http://localhost:4000/API/tasks/", {
      method: "POST",
      body: JSON.stringify(todo),
      headers: {
        "Content-Type": "application/json"
      }
    }).then( res => {
      if (!res.ok) {
        throw new Error("Failed!")
      }else {
        location.reload();
      }
    }).catch(err => {
      console.log(err);
    })
  }

  function toggleDone(id) {
    const index = todoItems.findIndex(item => item.id === id);
    const todo = {name: todoItems[index]};
    todoItems[index].checked = !todoItems[index].checked;
    fetch(`http://localhost:4000/API/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(todo),
      headers: {
        "Content-Type": "application/json"
      }
    }).then( res => {
      if (!res.ok) {
        throw new Error("Failed!")
      }
    }).catch(err => {
      console.log(err);
    })
    // location.reload();
  }

  function deleteTodo(id) {
    todoItems = todoItems.filter(item => item.id !== id);
    fetch(`http://localhost:4000/API/tasks/${id}`, {
      method: "DELETE",
      body: "ITEM DELETED",
      headers: {
        "Content-Type": "application/json"
      }
    }).then( res => {
      if (!res.ok) {
        throw new Error("Failed!")
      }
    }).catch(err => {
      console.log(err);
    })
     location.reload();
  }
</script>

<main>
  <div class="container">
    <h1 class="app-title">todos</h1>
    <ul class="todo-list">
      {#each todoItems as todo (todo.id)}
        <li class="todo-item {todo.checked ? 'done' : ''}">
          <input id={todo.id} type="checkbox" />
          <label for={todo.id} class="tick" on:click={() => toggleDone(todo.id)}></label>
          <span>{todo.text}</span>
          <button class="delete-todo" on:click={() => deleteTodo(todo.id)}>
            <svg><use href="#delete-icon"></use></svg>
          </button>
        </li>
      {/each}
    </ul>
    <div class="empty-state">
      <svg class="checklist-icon"><use href="#checklist-icon"></use></svg>
      <h2 class="empty-state__title">Add your first todo</h2>
      <p class="empty-state__description">What do you want to get done today?</p>
    </div>
    <form on:submit|preventDefault={addTodo}>
      <input class="js-todo-input" type="text" aria-label="Enter a new todo item" placeholder="E.g. Build a web app" bind:value={newTodo}>
    </form>
  </div>
</main>
