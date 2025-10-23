package com.evdealer.repository;

import com.evdealer.entity.DealerTarget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DealerTargetRepository extends JpaRepository<DealerTarget, UUID> {
    
    List<DealerTarget> findByTargetYear(Integer targetYear);
    
    List<DealerTarget> findByTargetMonth(Integer targetMonth);
    
    List<DealerTarget> findByTargetType(String targetType);
    
    List<DealerTarget> findByTargetStatus(String targetStatus);
    
    @Query("SELECT dt FROM DealerTarget dt WHERE dt.dealer.dealerId = :dealerId")
    List<DealerTarget> findByDealerDealerId(@Param("dealerId") UUID dealerId);
    
    List<DealerTarget> findByTargetScope(String targetScope);
    
    @Query("SELECT dt FROM DealerTarget dt WHERE dt.dealer.dealerId = :dealerId AND dt.targetYear = :targetYear")
    List<DealerTarget> findByDealerDealerIdAndTargetYear(@Param("dealerId") UUID dealerId, @Param("targetYear") Integer targetYear);
    
    @Query("SELECT dt FROM DealerTarget dt WHERE dt.targetYear = :year AND dt.targetMonth = :month")
    List<DealerTarget> findByTargetYearAndMonth(@Param("year") Integer year, @Param("month") Integer month);
    
    @Query("SELECT dt FROM DealerTarget dt WHERE dt.targetYear = :year AND dt.targetType = :type")
    List<DealerTarget> findByTargetYearAndType(@Param("year") Integer year, @Param("type") String type);
    
    @Query("SELECT dt FROM DealerTarget dt WHERE dt.achievementRate >= :minRate")
    List<DealerTarget> findByAchievementRateGreaterThanEqual(@Param("minRate") Double minRate);
    
    @Query("SELECT dt FROM DealerTarget dt WHERE dt.achievementRate < :maxRate")
    List<DealerTarget> findByAchievementRateLessThan(@Param("maxRate") Double maxRate);
}
