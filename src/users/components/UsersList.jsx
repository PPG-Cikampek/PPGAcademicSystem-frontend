// import { useState } from 'react';
// import { motion } from 'framer-motion';

// // Template fetch function
// const fetchData = async (url, options = {}) => {
//     console.log(`Fetching data from ${url} with options`, options);
//     // Add your API logic here
// };

// // UserList Component
// const UserList = ({ users, onEdit, onDelete }) => (
//     <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="space-y-4"
//     >
//         {users.map((user) => (
//             <div
//                 key={user.id}
//                 whileHover={{ scale: 1.02 }}
//                 className="card-basic justify-between m-0"
//             >
//                 <div className="flex items-center space-x-4">
//                     <img
//                         src={user.image}
//                         alt={user.name}
//                         className="w-10 h-10 rounded-full"
//                     />
//                     <div>
//                         <p className="font-bold text-gray-700">{user.name}</p>
//                         <p className="text-sm text-gray-500">{user.email}</p>
//                     </div>
//                 </div>
//                 <div className="flex space-x-2">
//                     <button
//                         onClick={() => onEdit(user.id)}
//                         className="button-primary"
//                     >
//                         Edit
//                     </button>
//                     <button
//                         label="Delete"
//                         onClick={() => onDelete(user.id)}
//                         className="button-danger"
//                     >
//                         Delete
//                     </button>
//                 </div>
//             </div>
//         ))}
//     </motion.div>
// );

// // Main UsersList Component
// const UsersList = () => {
//     const [users, setUsers] = useState([
//         //data here
//     ]);

//     const handleEdit = (userId) => {
//         console.log(`Edit user with id ${userId}`);
//     };

//     const handleDelete = (userId) => {
//         console.log(`Delete user with id ${userId}`);
//     };

//     const handleAddUser = () => {
//         console.log('Add new user');
//     };

//     return (
//         <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
//             <motion.h1
//                 initial={{ opacity: 0, y: -20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="text-2xl font-bold text-gray-800"
//             >
//                 User Management
//             </motion.h1>
//             <UserList users={users} onEdit={handleEdit} onDelete={handleDelete} />
//             <button
//                 onClick={handleAddUser}
//                 className="w-full button-primary bg-primary text-white hover:scale-[1.01] font-medium"
//             >
//                 Add User
//             </button>
//         </div>
//     );
// };

// export default UsersList;
