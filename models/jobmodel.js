// import mongoose from 'mongoose';

// const jobSchema = new mongoose.Schema({
//     company: {
//         type: String,
//         require: [true, 'Company name is reuired']
//     },
//     position: {
//         type: String,
//         require: [true, 'Job Position is required'],
//         maxlength: 100
//     },
//     status: {
//         type: String,
//         enum: ['pending', 'reject', 'interview'],
//         default: 'pending'
//     },
//     workType: {
//         type: String,
//         enum: ['full-time', 'part-time', 'internship', 'contract'],
//         default: 'full-time'
//     },
//     workLocation: {
//         type: String,
//         default: 'Bengaluru',
//         required: [true, 'Work location is required']
//     },
//     createdBy: {
//         type: mongoose.Types.ObjectId,
//         ref: 'User'
//     } 

// }, { timestamps: true }
// )

// module.exports= mongoose.model('Job', jobSchema)