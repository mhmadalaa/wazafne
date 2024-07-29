// // edit employee personal data

// exports.updateUser = catchAsync(async (req, res, next) => {
//   if (req.body.email || req.body.password) {
//     return res.status(401).json({
//       status: 'fail',
//       message:
//         'You can not update curcial data with this regualar update router',
//     });
//   }

//   const user = await User.findByIdAndUpdate(req.user.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   res.status(200).json({
//     status: 'success',
//     data: {
//       user,
//     },
//   });
// });