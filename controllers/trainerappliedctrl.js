const trainerAppliedTrainingSchema = require('../models/trainerappliedtrainingmodel.js');
const mongoose = require('mongoose');


const getAllAppliedTraining = async (req, res) => {
    try {
        const allAppliedTrainingDetails = await trainerAppliedTrainingSchema.find();

        // Filter out trainingDetails with appliedStatus set to false
        const filteredTrainingDetails = allAppliedTrainingDetails.map((document) => {
            const filteredDetails = document.trainingDetails.filter((detail) => {
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

        if (finalFilteredTrainingDetails.length === 0) {
            return res.status(200).json({ success: false, message: 'No Applied Training' });
        } else {
            return res.status(201).json({ success: true, message: 'Filtered Applied Training Fetched', appliedTrainingDetails: finalFilteredTrainingDetails });
        }
    } catch (error) {
        console.error('Error while fetching applied training details:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
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
        console.log(updatedTraining);

        if (updatedTraining) {
            resp.status(201).json({ success: true, message: 'Applied status updated successfully', updatedTraining });
        } else {
            resp.status(200).json({ success: false, message: 'Trainer training details not found' });
        }
    } catch (error) {
        console.error('Error updating applied status:', error);
        resp.status(200).json({ success: false, message: 'Internal server error' });
    }
};


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
const getFeedBack=async ()=>{
    const {trainerId}=req.params

    const findFeedBack=await trainerAppliedTrainingSchema.findById(trainerId,'trainingDetails')
   

}



module.exports = {
    getAllAppliedTraining, updateAppliedStatus, addFeedback
}