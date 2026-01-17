import { asyncHandler } from "../utils/asynchandler.js";
import{apierror} from "../utils/apierror.js";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { uploadoncloudinary } from "../utils/cloudinary.js";
import{ apiResponse } from "../utils/apiResponse.js"; 
import { Job } from "../models/company.model.js";  

const fetchCompanyDetails = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const company = await Company.findById(id);

  if (!company) {
    return next(new apierror(404, "Company details not found"));
  }

  return res.status(200).json(new apiResponse(200, company, "Company details fetched successfully"));
});

const editCcompanyDetails = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const updatedUser = await Company.findByIdAndUpdate(
      id,
      req.body, 
      {
        new: true,          
        runValidators: true
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

 
    res.status(200).json({
      success: true,
      message: "Company profile updated successfully",
      data: updatedUser,
    });

  } catch (error) {
    console.error("Edit Company Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}); 


const postJob = asyncHandler(async(req,res,next)=>{
   try {
    const { id } = req.params;

    
    const job = await Job.create({
      ...req.body,
      company: id
    });

    
    await Company.findByIdAndUpdate(
      id,
      { $push: { jobPostings: job._id } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "Job created & added to company",
      data: job
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
}); 
  

const fetchJobsByCompany = asyncHandler(async (req, res, next) => { 
  try {
    const { id } = req.params;
    

    const company = await Company.findById(id)
    .populate('jobPostings'); 
         // this will convert job IDs to full job objects
 
         console.log(company)

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found"
      });
    }

      return res.status(200).json(new apiResponse(200, company, "Company details fetched successfully"));
 

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }

})


  


export {
  fetchCompanyDetails,
  editCcompanyDetails,
  postJob,
  fetchJobsByCompany,
}