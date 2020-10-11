var users = ["vadym.rudenko@gmail.com"];

var data = [];

var getFormattedDate = (date) => {
  var year = date.getFullYear().toString().substring(2);
  var month = (1 + date.getMonth()).toString().padStart(2, '0');
  var day = date.getDate().toString().padStart(2, '0');

  return `${month}/${day}/${year}`;
}

users.forEach(function(user) {
  data.push({
    email: user,
    mbFirstDate: new Date(2030,1,1),
    mbLastDate: new Date(2001,1,1),
    workspaceFirstDate: new Date(2030,1,1),
    workspaceLastDate: new Date(2001,1,1)
  })
})
// var networkIds = db.Networks.find({"EnterpriseNetwork._id": "3a7d907aa12d42228bbd8d55308a8d6b"}).map(function(i) {return i._id})
// db.Collections.find({NetworkId: {$in: networkIds}, Type: {$in: ["Workspace"]}}).forEach(function(i) {
//   if (i.Users) {
//     i.Users.forEach(function(u) {
//       var userIndex = users.indexOf(u.EmailNormalized);
//       if (userIndex > -1) {
//         var user = data[userIndex];
//         if (user.workspaceFirstDate > new Date(u.CreatedOn)) {
//           user.workspaceFirstDate = new Date(u.CreatedOn)
//         }
//         if (user.workspaceLastDate < new Date(u.CreatedOn)) {
//           user.workspaceLastDate = new Date(u.CreatedOn)
//         }
//       }
//     })
//   }
// })
// db.Collections.find({"Network._id": {$in: networkIds}, Type: {$in: ["Share"]}}).forEach(function(i) {
//   if (i.Users2) {
//     i.Users2.forEach(function(u) {
//       var userIndex = users.indexOf(u.EmailNormalized);
//       if (userIndex > -1) {
//         var user = data[userIndex];
//         if (user.mbFirstDate > new Date(u.CreatedOn)) {
//           user.mbFirstDate = new Date(u.CreatedOn)
//         }
//         if (user.mbLastDate < new Date(u.CreatedOn)) {
//           user.mbLastDate = new Date(u.CreatedOn)
//         }
//       }
//     })
//   }
// })

data.forEach(function(u) {
  console.log(u.email + "," + getFormattedDate(u.workspaceLastDate) + "," + getFormattedDate(u.workspaceFirstDate) + "," + getFormattedDate(u.mbLastDate) + "," + getFormattedDate(u.mbFirstDate))
})
