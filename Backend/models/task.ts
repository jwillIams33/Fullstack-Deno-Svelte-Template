import getTasksCollection from '../helpers/db.ts';

export class Task{
    static async create(text: string) {
      const newTask = { name: text };
      try {
        await getTasksCollection()!.insertOne(newTask);
      } catch (err) {
        console.log(err);
        throw new Error('Failed to store task!');
      }
    }

    static async findAll() {
        try {
          const taskDocs = await getTasksCollection()!.find();
          return taskDocs;
        } catch (err) {
          console.log(err);
          throw new Error('Failed to find task!');
        }
      }

    static async findById(
        id: string
      ): Promise<{ name: string; _id: { $oid: string } } | undefined> {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error('Could not find task by id.');
        }
        try {
          const taskDoc = await getTasksCollection()!.findOne({
            _id: { $oid: id },
          });
          return taskDoc;
        } catch (err) {
          throw new Error('Could not find task by id.');
        }
      }

      static async update(id: string, checked: any) {
        const goal = await this.findById(id);
        const newData = checked.name;
        if (!goal) {
          throw new Error('Goal not found!');
        }
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error('Could not find task by id.');
        }
        try {
          await getTasksCollection()!.updateOne(
            { _id: { $oid: id } },
            { name: newData  }
          );
        } catch (err) {
          console.log(err);
          throw new Error('Failed to update task');
        }
      }
    

    static async delete(id: string) {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error('Could not find task by id.');
        }
        try {
          await getTasksCollection()!.deleteOne({ _id: { $oid: id } });
        } catch (err) {
          console.log(err);
          throw new Error('Failed to delete task.');
        }
      }
}
  