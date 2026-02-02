import jwt from 'jsonwebtoken';

export const generateToken = (user: any) => { 
  // console.log("================================>>>   ",user)
  const payload = {
    data: {
      uid: user.id.toString(),
      email: user.email || null,
      userName: user.username || null,
     
      districtId: user.district_id || null,
      zoneId: user.zone_id || null,
      
      departmentId: user.department_id || null,
      
      role: user.role_id|| null,
      isActive: user.is_active || null
    }
  };

  // Use the same fallback secret
  const JWT_SECRET = process.env.JWT_SECRET || 'uthamapal12am';
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '25d',
  });
};