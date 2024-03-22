const trainerAppliedTrainingSchema = require('../models/trainerappliedtrainingmodel.js');
const employerTrainingRequestSchema = require('../models/employerTrainingRequestmodel')


const employerTrainingRequest = async (req, resp) => {
    // console.log('req.boyd',req.body)
    try {
        const { _id } = req.user
        // const { trainerId } = req.params;
        const { trainer } = req.body
        const { trainingDetails } = req.body
        // console.log(trainingDetails)
        // console.log(trainer)
        console.log(_id)


        const existingApplication = await employerTrainingRequestSchema.findOne({
            // trainerId: trainer._id,
            employerId: _id,
            'trainingDetails.trainingPostDetails._id': trainingDetails?.trainingPostDetails?._id
        })
        const isAlreadyApplied = await employerTrainingRequestSchema.findOne({
            trainerId: trainer._id,
            'trainingDetails.trainingPostDetails._id': trainingDetails?.trainingPostDetails?._id
        })

        if (existingApplication && isAlreadyApplied) {
            console.log('Already Request sended ')
            return resp.status(200).json({ success: false, message: 'Trainer already Applied Accept the Training' })
        }
        else {
            const findRequest = await employerTrainingRequestSchema.findOne({ trainerId: trainer?._id,employerId: _id, });
            if (findRequest) {
                // console.log(trainingDetails)
                findRequest.trainingDetails.push(trainingDetails);
                await findRequest.save()
                // console.log(findRequest)
                resp.status(201).json({ success: true, message: 'Request Added Successfull' })
            }
            else {
                const newRequest = new employerTrainingRequestSchema({
                    trainerId: trainer._id,
                    employerId: _id,
                    trainerProfileImg: trainer?.basicInfo?.profileImg || "",
                    trainerName: trainer?.basicInfo?.firstName || "",
                    trainerDesignation: trainer?.basicInfo?.designation || "",
                    trainingDetails: [
                        {
                            trainingPostDetails: trainingDetails?.trainingPostDetails,
                        }
                    ]
                })
                await newRequest.save();

                console.log('newrequest', newRequest)
                resp.status(201).json({ success: true, message: 'Request submitted successfull' })
            }
        }

    }
    catch (error) {
        console.log(error);
    }

}

// for employer 

const getEmployerApplicationRequest = async (req, resp) => {
    const { _id } = req.user

    try {
const findAppliedTraining = await employerTrainingRequestSchema.find({ employerId: _id })
// .populate('trainingDetails.trainingPostDetails')
        
        // const trainingPostData = findAppliedTraining.trainingDetails.map(({ trainingPostDetails, appliedStatus, applicationstatus, _id, trainingResources, feedBackDetails }) => {
        //     // Destructure the `tocFile` key from `trainingPostDetails`
        //     // const { tocFile, ...updatedTrainingPostDetails } = trainingPostDetails;
        //     // Return the updated `trainingPostDetails` object without the `tocFile` key
        //     return {
        //         trainingPostDetails,
        //         appliedStatus,
        //         applicationstatus,
        //         _id,
        //         trainingResources,
        //         feedBackDetails
        //     };
        // });
        resp.status(201).json({ success: true, message: ' Data is fetching', trainingPostData: findAppliedTraining });
    }
    catch (error) {
        resp.status(200).json({ success: false, message: "Data not found" })
    }


}


// for trainer
const getAllRequestTrainer = async (req, resp) => {
    const { _id } = req.user
    try {

        const findAppliedTraining = await employerTrainingRequestSchema.find({ trainerId: _id }).populate('trainingDetails.trainingPostDetails')
        // const trainingPostData = findAppliedTraining.trainingDetails.map(({ trainingPostDetails, appliedStatus, applicationstatus, _id, trainingResources, feedBackDetails }) => {
        //     // Destructure the `tocFile` key from `trainingPostDetails`
        //     // const { tocFile, ...updatedTrainingPostDetails } = trainingPostDetails;
        //     // Return the updated `trainingPostDetails` object without the `tocFile` key
        //     return {
        //         trainingPostDetails,
        //         appliedStatus,
        //         applicationstatus,
        //         _id,
        //         trainingResources,
        //         feedBackDetails
        //     };
        // });
        resp.status(201).json({ success: true, message: ' Data is fetching', trainingPostData: findAppliedTraining });
    }
    catch (error) {
        resp.status(200).json({ success: false, message: "Data not found" })
    }

}


//for trainer 

// after this update add the training to the trainer Schema applied

function addTrainingData (trainingDetails) {
    // return new Promise((resolve, reject) => {
    //     TrainerSchema.findOne({_id : trainingDetails._trainerId},  
    //         {$push: {"applied": trainingDetails}}, {new: true})
    //         .then(data=>{
    //             resolve(data);
    //         }).catch(err => {reject("Error in adding data")});
    // })



}

const updateRequestStatus = async (req, resp) => {
    const { employerId, trainingDetailsId,trainingDetails, status } = req.body;
    const {_id}=req.body

    try {
        const updatedTraining = await employerTrainingRequestSchema.findOneAndUpdate(
            {
                employerId: employerId,
                'trainingDetails._id': trainingDetailsId// Filter by both trainerId and trainingDetailsId
            },
            {
                $set: {
                    'trainingDetails.$.appliedStatus': status === 'Denied' ? false : true,
                    'trainingDetails.$.applicationstatus': status === 'Denied' ? 'Denied' : 'Accepted'
                }
            },
            { new: true }
        );
            console.log(updatedTraining,"updated Training");
        await updatedTraining.save()
        // console.log(updatedTraining);


        if (updatedTraining) {
            const getAllRequestTraining=await employerTrainingRequestSchema.find({ employerId: _id })
            if(getAllRequestTraining){
                resp.status(201).json({ success: true, message: 'Applied status updated successfully', getAllRequestTraining });
            }
        } else {
            resp.status(200).json({ success: false, message: 'Trainer training details not found' });
        }
    } catch (error) {
        console.error('Error updating applied status:', error);
        resp.status(200).json({ success: false, message: 'Internal server error' });
    }

}


module.exports = {
    employerTrainingRequest,
    getEmployerApplicationRequest,
    updateRequestStatus,
    getAllRequestTrainer
}