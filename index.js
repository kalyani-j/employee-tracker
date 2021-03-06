const { prompt } = require("inquirer");
const logo = require("asciiart-logo");
const db = require("./db");
//const { updateEmployeeManager } = require("./db");
require("console.table");

init();

// Display logo text, load main prompts
function init() {
  const logoText = logo({ name: "Employee Manager" }).render();

  console.log(logoText);

  loadMainPrompts();
}

//User is prompted for choices on Organization structure
async function loadMainPrompts() {
  const { choice } = await prompt([
    {
      type: "list",
      name: "choice",
      message: "What would you like to do?",
      choices: [
        {
          name: "View All Employees",
          value: "VIEW_EMPLOYEES",
        },
        {
          name: "View All Employees By Department",
          value: "VIEW_EMPLOYEES_BY_DEPARTMENT",
        },
        // Bonus
        {
          name: "View All Employees By Manager",
          value: "VIEW_ALL_EMPLOYEES_BY_MANAGER",
        },
        {
          name: "View Employees By specific Manager",
          value: "VIEW_EMPLOYEES_BY_MANAGER",
        },
        {
          name: "Add Employee",
          value: "ADD_EMPLOYEE",
        },
        // Bonus
        {
          name: "Remove Employee",
          value: "REMOVE_EMPLOYEE"
        },
        {
          name: "Update Employee Role",
          value: "UPDATE_EMPLOYEE_ROLE",
        },
        // Bonus
        {
          name: "Update Employee Manager",
          value: "UPDATE_EMPLOYEE_MANAGER",
        },
        {
          name: "View All Roles",
          value: "VIEW_ROLES",
        },
        {
          name: "Add Role",
          value: "ADD_ROLE",
        },
        //  Bonus
        {
          name: "Remove Role",
          value: "REMOVE_ROLE"
        },
        {
          name: "View All Departments",
          value: "VIEW_DEPARTMENTS",
        },
        {
          name: "Add Department",
          value: "ADD_DEPARTMENT",
        },
        //  Bonus
        {
          name: "Remove Department",
          value: "REMOVE_DEPARTMENT",
        },
        {
          name: "Quit",
          value: "QUIT",
        },
      ],
    },
  ]);

  // Call the appropriate function depending on the user choice
  switch (choice) {
    // Employee Operations
    case "VIEW_EMPLOYEES":
      return viewEmployees();
    case "VIEW_EMPLOYEES_BY_DEPARTMENT":
      return viewEmployeesByDepartment();
    //View All employees by their manager details
    case "VIEW_ALL_EMPLOYEES_BY_MANAGER":
      return viewEmpManagers();
    //View Employees as subordinates for a selected Manager
    case "VIEW_EMPLOYEES_BY_MANAGER":
      return findAllEmployeesByManager();
    //remove emp
    case "REMOVE_EMPLOYEE":
      return removeEmployee();
    case "ADD_EMPLOYEE":
      return addEmployee();
    case "UPDATE_EMPLOYEE_ROLE":
      return updateEmployeeRole();
    case "UPDATE_EMPLOYEE_MANAGER":
      return updateEmployeeManager();
  
    //Department operations
    case "VIEW_DEPARTMENTS":
      return viewDepartments();
    case "ADD_DEPARTMENT":
      return addDepartment();
    case "REMOVE_DEPARTMENT":
      return removeDepartment();

    //Role operations
    case "VIEW_ROLES":
      return viewRoles();
    case "ADD_ROLE":
      return addRole();
    case "REMOVE_ROLE":
      return removeRole();

    default:
      return quit();
  }
}
//Employee Operations
async function viewEmployees() {
  const employees = await db.findAllEmployees();

  console.log("\n");
  console.table(employees);

  loadMainPrompts();
}

async function viewEmployeesByDepartment() {
  const departments = await db.findAllDepartments();

  const departmentChoices = departments.map(({ department_id, name }) => ({
    name: name,
    value: department_id,
  }));
  console.log(departmentChoices);

  const { departmentId } = await prompt([
    {
      type: "list",
      name: "departmentId",
      message: "Which department would you like to see employees for?",
      choices: departmentChoices,
    },
  ]);
  console.log(departmentId);

  const employees = await db.findAllEmployeesByDepartment(departmentId);

  console.log("\n");
  console.table(employees);

  loadMainPrompts();
}

async function viewEmpManagers() {
  const empManagers = await db.findAllEmpManagers();

  console.log("\n");
  console.table(empManagers);

  loadMainPrompts();
}

async function findAllEmployeesByManager() {
  const managers = await db.findOnlyManagers();
  const managerChoices = managers.map(
    ({ employee_id, first_name, last_name }) => ({
      name: `${first_name} ${last_name}`,
      value: employee_id,
    })
  );

  const { managerId } = await prompt([
    {
      type: "list",
      name: "managerId",
      message: "For which Manager would you like to see employees for?",
      choices: managerChoices,
    },
  ]);
  console.log(managerId);

  const employeesByMgr = await db.findAllEmployeesByManager(managerId);

  console.log("\n");
  console.table(employeesByMgr);

  loadMainPrompts();
}

async function addEmployee() {
  const roles = await db.findAllRoles();

  const employee = await prompt([
    {
      name: "first_name",
      message: "What is the employee's first name?",
    },
    {
      name: "last_name",
      message: "What is the employee's last name?",
    },
  ]);

  const roleChoices = roles.map(({ role_id, title }) => ({
    name: title,
    value: role_id,
  }));

  const { roleId } = await prompt({
    type: "list",
    name: "roleId",
    message: "What is the employee's role?",
    choices: roleChoices,
  });

  employee.role_id = roleId;

  const managers = await db.findAllEmployees();

  const managerChoices = managers.map(
    ({ employee_id, first_name, last_name }) => ({
      name: `${first_name} ${last_name}`,
      value: employee_id,
    })
  );
  managerChoices.unshift({ name: "None", value: null });

  const { managerId } = await prompt({
    type: "list",
    name: "managerId",
    message: "Who is the employee's manager?",
    choices: managerChoices,
  });

  employee.manager_id = managerId;

  console.log(employee);

  await db.createEmployee(employee);

  console.log(
    `Added ${employee.first_name} ${employee.last_name} to the database`
  );

  loadMainPrompts();
}

async function removeEmployee() {
  const employee = await db.findAllEmployees();

  const employeeChoices = employee.map(
    ({ employee_id, first_name, last_name }) => ({
      name: `${first_name} ${last_name}`,
      value: employee_id,
    })
  );

  const selectedEmployee = await prompt([
    {
      type: "list",
      name: "employee_id",
      message: "Which employee do you want to delete?",
      choices: employeeChoices,
    },
  ]);
  console.log(selectedEmployee.employee_id);
  await db.deleteEmployee(selectedEmployee.employee_id);

  console.log(`Removed ${selectedEmployee.employee_id} from the database`);

  loadMainPrompts();
}

async function updateEmployeeManager() {
  const employeesByMgr = await db.findAllEmpManagers();

  //Get all employees with manager names from Database
  const employeeChoices = employeesByMgr.map(
    ({ employee_id, first_name, last_name }) => ({
      name: `${first_name} ${last_name}`,
      value: employee_id,
    })
  );
  console.log(employeeChoices);

  // Choose from an employee to update manager
  const employee = await prompt([
    {
      type: "list",
      name: "employee_id",
      message: "Which employee's manager do you want to update?",
      choices: employeeChoices,
    },
  ]);
  console.log(employee.employee_id);

  //Get all employees except selected employee to add manager
  const managerList = await db.findAllPossibleManagers(employee.employee_id);
  console.log(managerList);

  const managerChoices = managerList.map(
    ({ employee_id, first_name, last_name }) => ({
      name: `${first_name} ${last_name}`,
      value: employee_id,
    })
  );

  const manager = await prompt([
    {
      type: "list",
      name: "manager_id",
      message: "Which manager do you want to choose for employee?",
      choices: managerChoices,
    },
  ]);

  console.log(employee.employee_id, manager.manager_id);
  await db.updateEmployeeManager(manager.manager_id, employee.employee_id);

  console.log(`Updated employee's manager!`);

  loadMainPrompts();
}

async function updateEmployeeRole() {
  const employees = await db.findAllEmployees();

  const employeeChoices = employees.map(
    ({ employee_id, first_name, last_name }) => ({
      name: `${first_name} ${last_name}`,
      value: employee_id,
    })
  );

  const { employeeId } = await prompt([
    {
      type: "list",
      name: "employeeId",
      message: "Which employee's role do you want to update?",
      choices: employeeChoices,
    },
  ]);

  const roles = await db.findAllRoles();

  const roleChoices = roles.map(({ role_id, title }) => ({
    name: title,
    value: role_id,
  }));

  const { roleId } = await prompt([
    {
      type: "list",
      name: "roleId",
      message: "Which role do you want to assign the selected employee?",
      choices: roleChoices,
    },
  ]);

  console.log(employeeId, roleId);
  await db.updateEmployeeRole(employeeId, roleId);

  console.log("Updated employee's role");

  loadMainPrompts();
}

//Role operations
async function viewRoles() {
  const roles = await db.findAllRoles();

  console.log("\n");
  console.table(roles);

  loadMainPrompts();
}

async function addRole() {
  const departments = await db.findAllDepartments();

  const departmentChoices = departments.map(({ department_id, name }) => ({
    name: name,
    value: department_id,
  }));

  const role = await prompt([
    {
      name: "title",
      message: "What is the name of the role?",
    },
    {
      name: "salary",
      message: "What is the salary of the role?",
    },
    {
      type: "list",
      name: "department_id",
      message: "Which department does the role belong to?",
      choices: departmentChoices,
    },
  ]);
  console.log(role.title, role.salary, role.department_id);
  await db.createRole(role);

  console.log(`Added ${role.title} to the database`);

  loadMainPrompts();
}

//removeRole
async function removeRole() {
  const roles = await db.findAllRoles();

  const roleChoices = roles.map(({ role_id, title }) => ({
    name: title,
    value: role_id,
  }));

  const selectedRole = await prompt([
    {
      type: "list",
      name: "role_id",
      message: "Which role do you want to delete?",
      choices: roleChoices,
    },
  ]);
  console.log(selectedRole.role_id);
  await db.deleteRole(selectedRole.role_id);

  console.log(`Removed ${selectedRole.role_id} from the database`);

  loadMainPrompts();
}


//Department operations
async function viewDepartments() {
  const departments = await db.findAllDepartments();

  console.log("\n");
  console.table(departments);

  loadMainPrompts();
}

async function addDepartment() {
  const department = await prompt([
    {
      name: "name",
      message: "What is the name of the department?",
    },
  ]);
  console.log(department.name);
  await db.createDepartment(department);

  console.log(`Added ${department.name} to the database`);

  loadMainPrompts();
}

//Remove department
async function removeDepartment() {
  const departments = await db.findAllDepartments();

  const departmentChoices = departments.map(({ department_id, name }) => ({
    name: name,
    value: department_id,
  }));

  const selectedDept = await prompt([
    {
      type: "list",
      name: "department_id",
      message: "Which department do you want to delete?",
      choices: departmentChoices,
    },
  ]);
  console.log(selectedDept.department_id);
  await db.deleteDepartment(selectedDept.department_id);

  console.log(`Removed ${selectedDept.department_id} from the database`);

  loadMainPrompts();
}

function quit() {
  console.log("Goodbye!");
  process.exit();
}
