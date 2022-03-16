const User = require("../models/user");


module.exports = class UserController {
  constructor(req, res, body) {
    this.req = req;
    this.res = res;
    this.body = body;
  }
  getUsers = async (page = 1) => {
    const PAGE_SIZE = 10;
    const skip = (page - 1) * PAGE_SIZE;
    const data = await User.findAll({
      limit: PAGE_SIZE,
      offset: skip,
      where: {},
    });
    if (data.length > 0) {
      this.res.writeHeader(200, { "Content-Type": "application/json" });
      this.res.write(JSON.stringify(data));
      this.res.end();
    } else {
      let data = { message: "Page index out of bound!" };
      this.res.writeHeader(404, { "Content-Type": "application/json" });
      this.res.write(JSON.stringify(data));
      this.res.end();
    }
  };

  getUser = async (uid) => {
    const data = await User.findAll({
      where: { id: uid },
    });
    if (data.length === 1) {
      this.res.writeHeader(200, { "Content-Type": "application/json" });
      this.res.write(JSON.stringify(data[0]));
      this.res.end();
    } else {
      let data = { message: "User not found!" };
      this.res.writeHeader(404, { "Content-Type": "application/json" });
      this.res.write(JSON.stringify(data));
      this.res.end();
    }
  };

  createUser = async () => {
    try {
      let user = JSON.parse(this.body);
      const data = await User.create({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
      });
      this.res.writeHeader(201, { "Content-Type": "application/json" });
      this.res.write(JSON.stringify(data));
      this.res.end();
    } catch (error) {
      this.res.writeHeader(409, { "Content-Type": "application/json" });
      this.res.write(JSON.stringify(error));
      this.res.end();
    }
  };

  createUsers = async () => {
    let users = JSON.parse(this.body);
    let flag = true;
    let res = [{ message: "The following users already exist." }, []];
    for (let user of users) {
      const data = await User.findAll({
        where: {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          age: user.age,
        },
      });
      if (data.length !== 0) {
        flag = false;
        res[1].push(user);
      }
    }
    if (flag) {
      users.forEach(async (user) => {
        const data = await User.create({
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          age: user.age,
        });
      });
      let data = { message: "Users added." };
      this.res.writeHeader(201, { "Content-Type": "application/json" });
      this.res.write(JSON.stringify(data));
      this.res.end();
    } else {
      this.res.writeHeader(409, { "Content-Type": "application/json" });
      this.res.write(JSON.stringify(res));
      this.res.end();
    }
  };

  deleteUsers = async () => {
    const data = await User.findAll({
      where: {},
    });
    if (data.length === 0) {
      let res = { message: "All users deleted", number_deleted: data.length };
      this.res.writeHeader(204, { "Content-Type": "application/json" });
      this.res.write(JSON.stringify(res));
      this.res.end();
    } else {
      await User.destroy({
        where: {},
        truncate: true,
      });
      let res = { message: "All users deleted", number_deleted: data.length };
      this.res.writeHeader(200, { "Content-Type": "application/json" });
      this.res.write(JSON.stringify(res));
      this.res.end();
    }
  };

  deleteUser = async (uid) => {
    const data = await User.findAll({
      where: { id: uid },
    });
    if (data.length === 1) {
      let res = [{ message: "User deleted" }];
      await User.destroy({
        where: { id: uid },
      });
      this.res.writeHeader(200, { "Content-Type": "application/json" });
      res.push(data[0]);
      this.res.write(JSON.stringify(res));
      this.res.end();
    } else {
      let data = { message: "User not found!" };
      this.res.writeHeader(404, { "Content-Type": "application/json" });
      this.res.write(JSON.stringify(data));
      this.res.end();
    }
  };

  updateUsers = async () => {
    let users = JSON.parse(this.body);
    await User.destroy({
      where: {},
      truncate: true,
    });
    try {
      users.forEach(async (user) => {
        const data = await User.create({
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          age: user.age,
        });
      });
      let data = { message: "All collection updated." };
      this.res.writeHeader(201, { "Content-Type": "application/json" });
      this.res.write(JSON.stringify(data));
      this.res.end();
    } catch (error) {
      let data = { message: "Error at collection update!" };
      this.res.writeHeader(500, { "Content-Type": "application/json" });
      this.res.write(JSON.stringify(data));
      this.res.end();
    }
  };

  updateUser = async () => {
    try {
      let user = JSON.parse(this.body);
      let data = await User.findAll({ where: { id: user.id } });
      if (data.length === 0) {
        let result = [{ message: "User id does not exist!" }];
        result.push(user);
        this.res.writeHeader(200, { "Content-Type": "application/json" });
        this.res.write(JSON.stringify(result));
        this.res.end();
      } else {
        data = await User.update(
          {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            age: user.age,
          },
          { where: { id: user.id } }
        );
        let result = [{ message: "User updated" }];
        result.push(user);
        this.res.writeHeader(200, { "Content-Type": "application/json" });
        this.res.write(JSON.stringify(result));
        this.res.end();
      }
    } catch (error) {
      this.res.writeHeader(500, { "Content-Type": "application/json" });
      this.res.write(JSON.stringify(error));
      this.res.end();
    }
  };

  execute() {
    const tokens = this.req.url.split("/");
    // GET
    if (this.req.method === "GET") {
      if (tokens.length === 3) {
        const page = Number(tokens[2]);
        if (!isNaN(page)) {
          this.getUsers(page);
        } else {
          this.res.writeHeader(404, { "Content-Type": "application/json" });
          this.res.end();
        }
      } else if (tokens.length === 4 && tokens[2] === "user") {
        const uid = Number(tokens[3]);
        if (!isNaN(uid)) {
          this.getUser(uid);
        } else {
          this.res.writeHeader(404, { "Content-Type": "application/json" });
          this.res.end();
        }
      } else {
        this.res.writeHeader(404, { "Content-Type": "application/json" });
        this.res.end();
      }
    }
    // POST
    else if (this.req.method === "POST") {
      if (tokens.length === 2) {
        this.createUsers();
      } else if (tokens.length === 3 && tokens[2] === "user") {
        this.createUser();
      } else {
        this.res.writeHeader(404, { "Content-Type": "application/json" });
        this.res.end();
      }
    }
    // PUT
    else if (this.req.method === "PUT") {
      if (tokens.length === 2) {
        this.updateUsers();
      } else if (tokens.length === 3 && tokens[2] === "user") {
        this.updateUser();
      } else {
        this.res.writeHeader(404, { "Content-Type": "application/json" });
        this.res.end();
      }
    }
    // DELETE
    else if (this.req.method === "DELETE") {
      if (tokens.length === 2) {
        this.deleteUsers();
      } else if (tokens.length === 4 && tokens[2] === "user") {
        const uid = Number(tokens[3]);
        if (!isNaN(uid)) {
          this.deleteUser(uid);
        } else {
          this.res.writeHeader(404, { "Content-Type": "application/json" });
          this.res.end();
        }
      } else {
        this.res.writeHeader(404, { "Content-Type": "application/json" });
        this.res.end();
      }
    }
    else{
      this.res.writeHeader(405, { "Content-Type": "application/json" });
      this.res.end();
    }
  }
};
