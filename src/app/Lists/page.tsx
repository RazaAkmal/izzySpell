import AllWords from '@/components/AllWordsList'
import DashboardLayout from '@/components/DashboardLayout'
import React from 'react'

function TotalLists() {
  return (
    <div>
      <DashboardLayout showFooter={false}>
       <AllWords/> 
        
      </DashboardLayout>
    </div>
  )
}

export default TotalLists
