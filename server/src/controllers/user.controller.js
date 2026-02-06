

export async function getProfile(req,res,next){
	try {
		const {user} = req
		res.status(200).json(user)
	} catch (err) {
		next(err)
	}
}