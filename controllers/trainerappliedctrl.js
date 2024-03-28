const trainerAppliedTrainingSchema = require('../models/trainerappliedtrainingmodel.js');
const trainerSchema = require('../models/trainermodel.js')
const mongoose = require('mongoose');


const getAllAppliedTraining = async (req, resp) => {
    try {
        const allAppliedTrainingDetails = await trainerAppliedTrainingSchema.find().sort({ createdAt: -1 });

        // Filter out trainingDetails with appliedStatus set to false and applicationstatus not equal to 'Denied'
        const filteredTrainingDetails = allAppliedTrainingDetails.map((document) => {
            const filteredDetails = document?.trainingDetails?.filter((detail) => {
                return detail.appliedStatus === false && detail.applicationstatus !== 'Denied';
            });

            return {
                ...document.toObject(),
                trainingDetails: filteredDetails
            };
        });

        // Filter out documents with empty trainingDetails array
        const finalFilteredTrainingDetails = filteredTrainingDetails.filter((document) => {
            return document.trainingDetails.length > 0;
        });

        // If there are no filtered training details, return an error response
        if (finalFilteredTrainingDetails.length === 0) {
            return resp.status(200).json({ success: false, message: 'No Applied Training' });
        } else {
            // Return the filtered applied training details
            return resp.status(201).json({ success: true, message: 'Filtered Applied Training Fetched', appliedTrainingDetails: finalFilteredTrainingDetails });
        }
    } catch (error) {
        console.error('Error while fetching applied training details:', error);
        return resp.status(500).json({ success: false, message: 'Internal Server Error', error });
    }
};


const updateAppliedStatus = async (req, resp) => {
    const { trainerId, trainingDetailsId, status } = req.body; // Assuming you're passing trainerId and trainingDetailsId in the request body
    // console.log(req.body)
    // console.log(trainerId,trainingDetailsId,status)
    try {
        const updatedTraining = await trainerAppliedTrainingSchema.findOneAndUpdate(
            {
                trainerId: trainerId,
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
        await updatedTraining.save()
        // console.log(updatedTraining);
        if (updatedTraining) {
            // Filter out trainingDetails with appliedStatus set to false
            const filteredTrainingDetails = updatedTraining.trainingDetails.filter((detail) => {
                return detail.appliedStatus === false && detail.applicationstatus !== 'Denied';
            });
            console.log('filter', filteredTrainingDetails);
            if(updatedTraining&&filteredTrainingDetails){

                resp.status(201).json({ success: true, message: 'Applied status updated successfully', appliedTrainingDetails: filteredTrainingDetails });
            }

        } else {
            resp.status(200).json({ success: false, message: 'Trainer training details not found' });
        }
    } catch (error) {
        console.error('Error updating applied status:', error);
        resp.status(200).json({ success: false, message: 'Internal server error' });
    }
};


const updateFeedBackTrainer = async (trainerId, rating, feedBack) => {
    const findTrainer = await trainerSchema.findById({ _id: trainerId })

}
const addFeedback = async (req, res) => {
    const { _id } = req.user;
    console.log(req.user)
    const { trainingDetailsId } = req.params;
    const { rating, feedBack } = req.body;

    const feedBackDetails = {
        reviewedById: _id,
        reviewedByName: req.user.basicInfo.firstName + " " + req.user.basicInfo.lastName || req.user.fullName,
        reviewedByDesignation: req.user.basicInfo.company,
        reviewedByImg: req.user.basicInfo.profileImg,
        rating: rating,
        feedBack: feedBack
    };

    try {
        const trainingPostData = await trainerAppliedTrainingSchema.findOneAndUpdate(
            {
                trainerId: req.body?.trainerId,
                'trainingDetails._id': trainingDetailsId
            },
            {
                $set: {
                    'trainingDetails.$.feedBackDetails': feedBackDetails
                }
            },
            { new: true }
        );

        if (!trainingPostData) {
            return res.status(404).json({ success: false, message: "No such training post found." });
        }

        return res.status(201).json({ success: true, message: 'Feedback added', trainingPostData });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};


// by user id 
const getFeedBack = async () => {
    const { trainerId } = req.params

    const findFeedBack = await trainerAppliedTrainingSchema.findById(trainerId, 'trainingDetails')


}



module.exports = {
    getAllAppliedTraining, updateAppliedStatus, addFeedback
}